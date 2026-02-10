package net.atos.entng.actualites.services.impl;

import com.google.common.collect.Sets;
import fr.wseduc.transformer.IContentTransformerClient;
import fr.wseduc.transformer.to.ContentTransformerFormat;
import fr.wseduc.transformer.to.ContentTransformerRequest;
import fr.wseduc.transformer.to.ContentTransformerResponse;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.services.InfoService;
import net.atos.entng.actualites.to.*;
import org.apache.commons.lang3.StringUtils;
import org.entcore.common.editor.IContentTransformerEventRecorder;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;

public class InfoTransformerServiceImpl implements InfoService {

    private static final Logger log = LoggerFactory.getLogger(InfoTransformerServiceImpl.class);
    private final InfoService infoService;
    private final IContentTransformerClient contentTransformerClient;
    private final IContentTransformerEventRecorder transformerEventRecorder;

    public InfoTransformerServiceImpl(IContentTransformerClient transformerClient,
                                      IContentTransformerEventRecorder transformerEventRecorder,
                                      InfoService infoService) {
        this.infoService = infoService;
        this.contentTransformerClient = transformerClient;
        this.transformerEventRecorder = transformerEventRecorder;

    }

    @Override
    public void create(JsonObject data, UserInfos user, String eventStatus, HttpServerRequest serverRequest, Handler<Either<String, JsonObject>> handler) {
        log.info(String.format("[%s] Transform content of info for user %s ", getClass().getSimpleName(), user.getUserId()));

        if( StringUtils.isEmpty(data.getString("content"))) {
            infoService.create(data, user, eventStatus, serverRequest, handler);
            return;a
        }
        applyTransformation(user, data, handler, (response) -> {
                    data.put("content", response.getCleanHtml());
                    this.infoService.create(data, user, eventStatus, serverRequest, h -> {
                        if (h.isRight()) {
                           JsonObject created = h.right().getValue();
                           transformerEventRecorder.recordTransformation(created.getString("id"), "info", response, serverRequest);
                        }
                        handler.handle(h);
                    });
                });
    }

    @Override
    public void update(String id, JsonObject data, UserInfos user, String eventStatus, HttpServerRequest request, Handler<Either<String, JsonObject>> handler) {
        infoService.retrieve(id, false, h -> {
            if (h.isLeft()) {
                handler.handle(new Either.Left<>("This info doesn't exists"));
                return;
            }
            JsonObject actualInfo = h.right().getValue();
            data.put("content_version", 1);
            if (!data.containsKey("title")) {
                data.put("title", actualInfo.getString("title"));
            }
            //update content only if we update the content or the content is in old version with no update
            if ( (!data.containsKey("content") || data.getString("content") == null )
                    && "1".equals(actualInfo.getString("content_version"))) {
                data.put("content", actualInfo.getString("content"));
                this.infoService.update(id, data, user, eventStatus, request, handler);
                return;
            }
            //keep content if we receive a null or no content
            if (!data.containsKey("content") || data.getString("content") == null) {
              data.put("content", actualInfo.getString("content"));
            }
            //transform only if we have something to transform
            if (StringUtils.isEmpty(data.getString("content"))) {
                this.infoService.update(id, data, user, eventStatus, request, handler);
                return;
            }
            applyTransformation(user, data, handler, (response) -> {
                data.put("content", response.getCleanHtml());
                this.infoService.update(id, data, user, eventStatus, request, handler);
                transformerEventRecorder.recordTransformation(id, "info", response, request);
            });
        });
    }

    private void applyTransformation(UserInfos user, JsonObject data, Handler<Either<String, JsonObject>> handler,
                                     Consumer<ContentTransformerResponse> apply) {
        contentTransformerClient
                .transform(new ContentTransformerRequest(
                        Sets.newHashSet(ContentTransformerFormat.HTML),
                        0,
                        data.getString("content"),
                        null))
                .onSuccess(apply::accept)
                .onFailure(throwable -> {
                    log.error("Error while transforming content of info for user " + user.getUserId(), throwable);
                    handler.handle(new Either.Left<>("Error while transforming content"));
                });
    }

    @Override
    public void transformerUpdateQuietly(News news) {
        this.infoService.transformerUpdateQuietly(news);
    }

    @Override
    public void retrieve(String id, boolean filterAdmlGroup,
                         Handler<Either<String, JsonObject>> handler) {
        infoService.retrieve(id, filterAdmlGroup, handler);
    }

    @Override
    public void retrieve(String id, UserInfos user, boolean originalContent, Handler<Either<String, JsonObject>> handler) {
        infoService.retrieve(id, user, originalContent, handler);
    }

    @Override
    public void list(UserInfos user, boolean optimized, Handler<Either<String, JsonArray>> handler) {
        infoService.list(user, optimized, handler);
    }

    @Override
    public void listComments(Long infoId, Handler<Either<String, JsonArray>> handler) {
        infoService.listComments(infoId, handler);
    }

    @Override
    public void listShared(Long infoId, Handler<Either<String, JsonArray>> handler) {
        infoService.listShared(infoId, handler);
    }

    @Override
    public void listByThreadId(String id, UserInfos user, Handler<Either<String, JsonArray>> handler) {
        infoService.listByThreadId(id, user, handler);
    }

    @Override
    public void listLastPublishedInfos(UserInfos user, int resultSize, boolean optimized, Handler<Either<String, JsonArray>> handler) {
        infoService.listLastPublishedInfos(user,  resultSize, optimized, handler);
    }

    @Override
    public Future<List<NewsLight>> listLastPublishedInfos(UserInfos user, int resultSize) {
        return infoService.listLastPublishedInfos(user, resultSize);
    }

    @Override
    public void listForLinker(UserInfos user, Handler<Either<String, JsonArray>> handler) {
        infoService.listForLinker(user, handler);
    }

    @Override
    public void getSharedWithIds(String infoId, Boolean filterAdmlGroup, Handler<Either<String, JsonArray>> handler) {
        infoService.getSharedWithIds(infoId, filterAdmlGroup, handler);
    }

    @Override
    public void getRevisions(Long infoId, Handler<Either<String, JsonArray>> handler) {
        infoService.getRevisions(infoId, handler);
    }

    @Override
    public void getOwnerInfo(String infoId, Handler<Either<String, JsonObject>> handler) {
        infoService.getOwnerInfo(infoId,  handler);
    }


    @Override
    public Future<List<News>> listPaginated(Map<String, SecuredAction> securedActions, UserInfos user, int page, int pageSize, Integer threadId) {
        return transformAndUpdateNewsContent(this.infoService.listPaginated(securedActions, user, page, pageSize, threadId));
    }

    @Override
    public Future<List<News>> listPaginated(Map<String, SecuredAction> securedActions, UserInfos user, int page, int pageSize, List<Integer> threadIds, List<NewsStatus> statuses) {
        return transformAndUpdateNewsContent(this.infoService.listPaginated(securedActions, user, page, pageSize, threadIds, statuses));
    }

    @Override
    public Future<List<News>> listPaginated(Map<String, SecuredAction> securedActions, UserInfos user, int page, int pageSize, List<Integer> threadIds, List<NewsStatus> statuses, List<NewsState> states) {
        return transformAndUpdateNewsContent(this.infoService.listPaginated(securedActions, user, page, pageSize, threadIds, statuses, states));
    }

    @Override
    public Future<NewsComplete> getFromId(Map<String, SecuredAction> securedActions, UserInfos user, int infoId, boolean originalContent) {
        return infoService.getFromId(securedActions, user, infoId, originalContent);
    }

    @Override
    public Future<JsonObject> getStats(UserInfos user, Boolean viewHidden) {
        return infoService.getStats(user, viewHidden);
    }

    private Future<List<News>> transformAndUpdateNewsContent(Future<List<News>> newsRes) {
        return newsRes.compose(newsList -> {
            List<Future<News>> futures = newsList.stream()
                    .map(news -> news.getContentVersion() == 0 && !StringUtils.isEmpty(news.getContent())
                            ? updateNewsContent(news)
                            : Future.succeededFuture(news))
                    .collect(Collectors.toList());

            return Future.all(new ArrayList<>(futures))
                    .map(cf -> futures.stream()
                            .map(f -> (News) f.result())
                            .collect(Collectors.toList()));
        });
    }

    private Future<News> updateNewsContent(News news) {
        log.info(String.format("[%s] Transform old content of info %s ", getClass().getSimpleName(), news.getId()));
        Future<ContentTransformerResponse> responseFuture = contentTransformerClient
                .transform(new ContentTransformerRequest(
                        Sets.newHashSet(ContentTransformerFormat.HTML),
                        news.getContentVersion(),
                        news.getContent(),
                        null));
        return responseFuture.compose( contentTransformerResponse -> {
                    news.setContent(contentTransformerResponse.getCleanHtml());
                    news.setContentVersion(1);
                    transformerUpdateQuietly(news);
                return Future.succeededFuture(news);
            }).otherwise(news)
              .onFailure( h -> log.error(String.format("[%s] An error occurred while calling transformer", getClass().getSimpleName()), h));
    }

}
