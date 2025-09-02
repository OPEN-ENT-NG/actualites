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
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;
import io.vertx.core.json.JsonObject;
import net.atos.entng.actualites.services.InfoService;
import net.atos.entng.actualites.services.InfoTransformerService;
import net.atos.entng.actualites.to.News;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;

public class InfoTransformerServiceImpl implements InfoTransformerService {

    private static final Logger log = LoggerFactory.getLogger(InfoTransformerServiceImpl.class);
    private final InfoService infoService;
    private final IContentTransformerClient contentTransformerClient;

    public InfoTransformerServiceImpl(IContentTransformerClient transformerClient) {
        this.infoService = new InfoServiceSqlImpl();
        this.contentTransformerClient = transformerClient;

    }

    @Override
    public void create(JsonObject data, UserInfos user, String eventStatus, Handler<Either<String, JsonObject>> handler) {
        log.info(String.format("[%s] Transform content of info for user %s ", getClass().getSimpleName(), user.getUserId()));

        applyTransformation(user, data, handler, (response) -> {
                    data.put("content", response.getCleanHtml());
                    this.infoService.create(data, user, eventStatus, handler);
                });
    }

    @Override
    public void update(String id, JsonObject data, UserInfos user, String eventStatus, Handler<Either<String, JsonObject>> handler) {
        applyTransformation(user, data, handler, (response) -> {
            data.put("content", response.getCleanHtml());
            data.put("content_version", 1);
            this.infoService.update(id, data, user, eventStatus, handler);
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
    public void transformerUpdate(News news) {
        this.infoService.transformerUpdate(news);
    }


    @Override
    public Future<List<News>> listPaginated(Map<String, SecuredAction> securedActions, UserInfos user, int page, int pageSize, Integer threadId) {
        return transformAndUpdateNewsContent(this.infoService.listPaginated(securedActions, user, page, pageSize, threadId));

    }

    private Future<List<News>> transformAndUpdateNewsContent(Future<List<News>> newsRes) {
        return newsRes.compose(newsList -> {
            List<Future<News>> futures = newsList.stream()
                    .map(news -> news.getContentVersion() == 0
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
                    transformerUpdate(news);
                return Future.succeededFuture(news);
            }).otherwise(news)
              .onFailure( h -> log.error(String.format("[%s] An error occurred while calling transformer", getClass().getSimpleName()), h));
    }

}
