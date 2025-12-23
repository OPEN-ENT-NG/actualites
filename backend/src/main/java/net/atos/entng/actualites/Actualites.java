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

package net.atos.entng.actualites;

import fr.wseduc.cron.CronTrigger;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.transformer.ContentTransformerFactoryProvider;
import fr.wseduc.transformer.IContentTransformerClient;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.constants.Field;
import net.atos.entng.actualites.controllers.CommentController;
import net.atos.entng.actualites.controllers.DisplayController;
import net.atos.entng.actualites.controllers.InfoController;
import net.atos.entng.actualites.controllers.ThreadController;
import net.atos.entng.actualites.controllers.v1.CommentControllerV1;
import net.atos.entng.actualites.controllers.v1.InfosControllerV1;
import net.atos.entng.actualites.controllers.v1.ThreadControllerV1;
import net.atos.entng.actualites.cron.PublicationCron;
import net.atos.entng.actualites.services.*;
import net.atos.entng.actualites.services.impl.*;
import org.entcore.common.editor.ContentTransformerConfig;
import org.entcore.common.editor.ContentTransformerEventRecorderFactory;
import org.entcore.common.editor.IContentTransformerEventRecorder;
import org.entcore.common.events.EventHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.service.impl.SqlCrudService;
import org.entcore.common.service.impl.SqlSearchService;
import org.entcore.common.share.ShareRoles;
import org.entcore.common.share.ShareService;
import org.entcore.common.share.impl.SqlShareService;
import org.entcore.common.sql.SqlConf;
import org.entcore.common.sql.SqlConfs;
import org.entcore.common.utils.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class Actualites extends BaseServer {
	public final static String NEWS_SCHEMA = "actualites";

	public final static String THREAD_RESOURCE_ID = "threadid";
	public final static String THREAD_TABLE = "thread";
	public final static String THREAD_SHARE_TABLE = "thread_shares";

	public final static String INFO_RESOURCE_ID = "infoid";
	public final static String INFO_TABLE = "info";
	public final static String INFO_SHARE_TABLE = "info_shares";
	public final static String INFO_REVISION_TABLE = "info_revision";

	public final static String USER_TABLE = "users";
	public final static String GROUP_TABLE = "groups";
	public final static String MEMBER_TABLE = "members";
	public final static String COMMENT_TABLE = "comment";

	public final static String MANAGE_RIGHT_ACTION = "net-atos-entng-actualites-controllers-ThreadController|updateThread";

	public final static String SHARE_CONF_KEY = "share";

	private JsonObject rights;
	private ThreadMigrationService threadMigrationService;

	@Override
	public void start(Promise<Void> startPromise) throws Exception {
		super.start(startPromise);
		final EventBus eb = getEventBus(vertx);
		final JsonObject config = config();
		rights = ShareRoles.getSecuredActionNameByNormalizedRole(securedActions);
		threadMigrationService = new ThreadMigrationServiceImpl(new GroupServiceImpl(getEventBus(vertx)), rights);

		// Subscribe to events published for transition
		setRepositoryEvents(new ActualitesRepositoryEvents(config.getBoolean("share-old-groups-to-users", false),vertx));

		if (config.getBoolean("searching-event", true)) {
			final List<String> searchFields = new ArrayList<String>();
			searchFields.add("text_searchable");
			setSearchingEvents(new ActualitesSearchingEvents(new SqlSearchService(getSchema(), INFO_TABLE, INFO_SHARE_TABLE, searchFields)));
		}

		ConfigService configService = ConfigService.getInstance();
		configService.setShareConfig(config.getJsonObject(SHARE_CONF_KEY));

		ContentTransformerFactoryProvider.init(vertx);
		final JsonObject contentTransformerConfig = ContentTransformerConfig.getContentTransformerConfig(vertx).orElse(null);
		final IContentTransformerClient contentTransformerClient = ContentTransformerFactoryProvider.getFactory("actualites", contentTransformerConfig).create();
		final IContentTransformerEventRecorder contentEventRecorder = new ContentTransformerEventRecorderFactory("actualites", contentTransformerConfig).create();

		addController(new DisplayController());

		// set default rights filter
		setDefaultResourceFilter(new ShareAndOwner());

		// thread table
		SqlConf confThread = SqlConfs.createConf(ThreadController.class.getName());
		confThread.setResourceIdLabel(THREAD_RESOURCE_ID);
		confThread.setTable(THREAD_TABLE);
		confThread.setShareTable(THREAD_SHARE_TABLE);
		confThread.setSchema(getSchema());

		//share service
		ShareService threadShareService = null;
		ShareService infoShareService = null;
		if(config.getBoolean("optimized-share-service", false)) {
			threadShareService = new OptimizedShareService(getSchema(),THREAD_SHARE_TABLE, eb, securedActions, null);
			infoShareService = new OptimizedShareService(getSchema(),INFO_SHARE_TABLE, eb, securedActions, null);
		} else {
			threadShareService = new SqlShareService(getSchema(),THREAD_SHARE_TABLE, eb, securedActions, null);
			infoShareService = new SqlShareService(getSchema(),INFO_SHARE_TABLE, eb, securedActions, null);
		}

		// thread controller
		ThreadController threadController = new ThreadController(eb, threadMigrationService);
		SqlCrudService threadSqlCrudService = new SqlCrudService(getSchema(), THREAD_TABLE, THREAD_SHARE_TABLE, new JsonArray().add("*"), new JsonArray().add("*"), true);
		threadController.setCrudService(threadSqlCrudService);
		threadController.setShareService(threadShareService);
		addController(threadController);

		ThreadControllerV1 threadControllerV1 = new ThreadControllerV1();
		threadControllerV1.setThreadService(new ThreadServiceSqlImpl().setEventBus(eb));
		threadControllerV1.setThreadMigrationService(threadMigrationService);
		final EventStore eventStoreThread = EventStoreFactory.getFactory().getEventStore(Actualites.class.getSimpleName());
		threadControllerV1.setEventHelper(new EventHelper(eventStoreThread));
		threadControllerV1.setCrudService(threadSqlCrudService);
		threadControllerV1.setShareService(threadShareService);
		addController(threadControllerV1);

		// info table
		SqlConf confInfo = SqlConfs.createConf(InfoController.class.getName());
		confInfo.setResourceIdLabel(INFO_RESOURCE_ID);
		confInfo.setTable(INFO_TABLE);
		confInfo.setShareTable(INFO_SHARE_TABLE);
		confInfo.setSchema(getSchema());


		//info service transformer
		InfoService infoService = new InfoTransformerServiceImpl(contentTransformerClient, contentEventRecorder, new InfoServiceSqlImpl());

		//notification timeline
		NotificationTimelineService notificationTimelineService = new NotificationTimelineServiceImpl(infoService,  new ThreadServiceSqlImpl().setEventBus(eb), vertx, eb, config);

		// info controller
		InfoController infoController = new InfoController(config, notificationTimelineService);
		SqlCrudService infoSqlCrudService = new SqlCrudService(getSchema(), INFO_TABLE, INFO_SHARE_TABLE, new JsonArray().add("*"), new JsonArray().add("*"), true);
		infoController.setInfoService(infoService);
		infoController.setCrudService(infoSqlCrudService);
		infoController.setShareService(infoShareService);
		addController(infoController);

		InfosControllerV1 infosControllerV1 = new InfosControllerV1(notificationTimelineService, rights);
		infosControllerV1.setInfoService(infoService);
		infosControllerV1.setTimelineMongo(new TimelineMongoImpl(Field.TIMELINE_COLLECTION, MongoDb.getInstance()));
		infosControllerV1.setCrudService(infoSqlCrudService);
		infosControllerV1.setShareService(infoShareService);
		addController(infosControllerV1);


		// comment table
		SqlConf confComment = SqlConfs.createConf(CommentController.class.getName());
		confComment.setTable(COMMENT_TABLE);
		confComment.setSchema(getSchema());

		// comment controller
		CommentController commentController = new CommentController();
		SqlCrudService commentSqlCrudService = new SqlCrudService(getSchema(), COMMENT_TABLE);
		commentController.setCrudService(commentSqlCrudService);
		addController(commentController);

		CommentControllerV1 commentControllerV1 = new CommentControllerV1();
		commentControllerV1.setInfoService(infoService);
		commentControllerV1.setCrudService(commentSqlCrudService);
		addController(commentControllerV1);

		// News publication cron task
		String publicationCron = config.getString("news-publication-cron", "0 0 * * * ? *");
		if (!StringUtils.isEmpty(publicationCron)) {
			new CronTrigger(vertx, publicationCron).schedule(new PublicationCron(notificationTimelineService));
		}
	}

	@Override
	protected Future<Void> postSqlScripts() {
		final ThreadService threadService = new ThreadServiceSqlImpl().setEventBus(getEventBus(vertx));
		return super.postSqlScripts()
				.compose(Void -> threadService.attachThreadsWithNullStructureToDefault())
				.compose(Void -> threadMigrationService.addAdminLocalToThreads());
	}

}
