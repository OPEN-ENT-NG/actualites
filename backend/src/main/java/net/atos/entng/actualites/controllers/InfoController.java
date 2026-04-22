/*
 * Copyright © Région Nord Pas de Calais-Picardie,  Département 91, Région Aquitaine-Limousin-Poitou-Charentes, 2016.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package net.atos.entng.actualites.controllers;

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.request.RequestUtils;
import io.micrometer.common.util.StringUtils;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.constants.Field;
import net.atos.entng.actualites.filters.InfoFilter;
import net.atos.entng.actualites.filters.ThreadFilter;
import net.atos.entng.actualites.services.*;
import net.atos.entng.actualites.services.impl.ThreadServiceSqlImpl;
import net.atos.entng.actualites.services.impl.TimelineMongoImpl;
import net.atos.entng.actualites.utils.Events;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.notification.NotificationUtils;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.function.Function;

import static net.atos.entng.actualites.filters.RightConstants.*;
import static org.entcore.common.http.response.DefaultResponseHandler.*;
import static org.entcore.common.user.UserUtils.getUserInfos;

public class InfoController extends ControllerHelper {

    public static final String RESULT_SIZE_PARAMETER = "resultSize";

    private static final String EVENT_TYPE = "NEWS";
    public static final String NEWS_SUBMIT_EVENT_TYPE = EVENT_TYPE + "_SUBMIT";
    public static final String NEWS_PUBLISH_EVENT_TYPE = EVENT_TYPE + "_PUBLISH";
    public static final String NEWS_UPDATE_EVENT_TYPE = EVENT_TYPE + "_UPDATE";


    // TODO : refactor code to use enums or constants for statuses
    // TRASH: 0; DRAFT: 1; PENDING: 2; PUBLISHED: 3

    protected InfoService infoService;
    protected final ThreadService threadService;
    protected final TimelineMongo timelineMongo;
    protected final EventHelper eventHelper;
    protected final boolean optimized;

    public InfoController(final JsonObject config){
        this.threadService = new ThreadServiceSqlImpl();
        this.timelineMongo = new TimelineMongoImpl(Field.TIMELINE_COLLECTION, MongoDb.getInstance());
        final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(Actualites.class.getSimpleName());
        eventHelper = new EventHelper(eventStore);
        optimized = config.getBoolean("optimized-query", true);
        
    }

    @Override
    protected boolean shouldNormalizedRights() {
        return true;
    }

    @Override
    protected Function<JsonObject, Optional<String>> jsonToOwnerId() {
        return json -> Optional.of(json.getString("owner"));
    }


    @Deprecated
    @Get("/infos/:"+Actualites.INFO_RESOURCE_ID+"/comments")
    @ApiDoc("Get infos comments. DEPRECATED - Used by mobile app only.")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = INFO_READ_VALUE, type = ActionType.RESOURCE, right = INFO_READ_ANNOTATION)
    public void getInfoComments(final HttpServerRequest request) {
        final String infoId = request.params().get(Actualites.INFO_RESOURCE_ID);
        Long id;
        try {
            id = Long.parseLong(infoId);
        } catch (NumberFormatException nfe) {
            badRequest(request);
            return;
        }
        infoService.listComments(id, arrayResponseHandler(request));
    }


    @Deprecated
    @Get("/infos/last/:"+RESULT_SIZE_PARAMETER)
    @ApiDoc("Get infos in thread by status and by thread id. DEPRECATED - Used by widget only.")
    @SecuredAction("actualites.infos.list")
    public void listLastPublishedInfos(final HttpServerRequest request) {
        log.warn("[DEPRECATED] GET /infos/last/:resultSize called - This endpoint should no longer be used");
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {
                String resultSize = request.params().get(RESULT_SIZE_PARAMETER);
                int size;
                if (resultSize == null || resultSize.trim().isEmpty()) {
                    badRequest(request);
                    return;
                }
                else {
                    try {
                        size = Integer.parseInt(resultSize);
                    } catch (NumberFormatException e) {
                        badRequest(request, "actualites.widget.bad.request.size.must.be.an.integer");
                        return;
                    }
                    if(size <=0 || size > 20) {
                        badRequest(request, "actualites.widget.bad.request.invalid.size");
                        return;
                    }
                }
                infoService.listLastPublishedInfos(user, size, optimized, arrayResponseHandler(request));
            }
        });
    }

    private static final int LIST_MAX_PAGE_SIZE = 50;
    private static final int LIST_DEFAULT_PAGE_SIZE = 20;

    @Deprecated
    @Get("/list")
    @ApiDoc("List infos with pagination. Accept custom page size. Params threadId can be used to restrict the list to this thread. DEPRECATED - Used by mobile app only.")
    @SecuredAction("actualites.infos.list.page")
    public void listInfosPagined(final HttpServerRequest request) {
        // TODO IMPROVE : Security on Infos visibles by statuses / dates is not enforced
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {

                // 1. Parse args

                int page = 0;
                int pageSize = LIST_DEFAULT_PAGE_SIZE;
                Integer threadId = null;

                try {
                    if (request.params().contains("page")) {
                        page = Integer.parseInt(request.params().get("page"));
                        if (page < 0) throw new IllegalArgumentException("page number must be positive");
                    }
                    if (request.params().contains("pageSize")) {
                        pageSize = Integer.parseInt(request.params().get("pageSize"));
                        if (pageSize <= 0) throw new IllegalArgumentException("page size must be positive non-zero");
                        if (pageSize > LIST_MAX_PAGE_SIZE) throw new IllegalArgumentException("page size maximum exceeded");
                    }
                    if (request.params().contains("threadId")) {
                        threadId = new Integer(request.params().get("threadId"));
                    }

                } catch (IllegalArgumentException e) {
                    badRequest(request);
                    return;
                }

                // 2. Call service

                infoService.listPaginated(securedActions, user, page, pageSize, threadId)
                        .onSuccess(news -> render(request, news))
                        .onFailure(ex -> renderError(request));
            } else {
                unauthorized(request);
            }
        });
    }

    @Deprecated
    @Get("/info/:"+Actualites.INFO_RESOURCE_ID)
    @ApiDoc("Get info from its id. DEPRECATED - Used by mobile app only.")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = INFO_READ_VALUE, type = ActionType.RESOURCE, right = INFO_READ_ANNOTATION)
    public void getSingleInfo(final HttpServerRequest request) {
        // TODO IMPROVE : Security on Infos visibles by statuses / dates is not enforced
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                // 1. Parse args
                final int infoId = Integer.parseInt(request.params().get(Actualites.INFO_RESOURCE_ID));
                boolean originalContent = Boolean.parseBoolean(request.getParam("originalContent", "false"));

                // 2. Call service
                infoService.getFromId(securedActions, user, infoId, originalContent)
                        .onSuccess(news -> render(request, news))
                        .onFailure(ex -> renderError(request));

            } else {
                unauthorized(request);
            }
        });
    }

    public void setInfoService(InfoService infoService) {
        this.infoService = infoService;
    }

}
