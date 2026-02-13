package net.atos.entng.actualites.broker;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.edificefalc.ContentBlock;
import org.entcore.edificefalc.ContentRequest;
import org.entcore.edificefalc.ContentResponse;
import org.entcore.edificefalc.Data;
import org.entcore.edificefalc.EdificeFalcPublisher;
import org.entcore.edificefalc.Opentype;

public class FalcClient {
    private static final Logger log = LoggerFactory.getLogger(FalcClient.class);
    
    private final EdificeFalcPublisher publisher;

    public FalcClient(Vertx vertx) {
        this.publisher = new EdificeFalcPublisher(vertx);
    }

    public Future<String> simplifyContent(String userId, String session, String userAgent, String content) {
        ContentRequest request = new ContentRequest(
                userAgent != null ? userAgent : "",
                content,
                Opentype.FALC,
                "",
                session,
                userId
        );

        return publisher.processContent(request)
                .compose(response -> {
                    if (response != null && response.getData() != null) {
                        Data data = response.getData();
                        if (data.getBody() != null && !data.getBody().isEmpty()) {
                            ContentBlock firstBlock = data.getBody().get(0);
                            if (firstBlock != null && firstBlock.getContent() != null) {
                                log.debug("FALC transformation completed successfully via NATS");
                                return Future.succeededFuture(firstBlock.getContent());
                            }
                        }
                    }
                    log.warn("FALC response is null or empty, returning null");
                    return Future.succeededFuture(null);
                })
                .recover(err -> {
                    log.error("Error during FALC transformation via NATS", err);
                    return Future.failedFuture(err);
                });
    }
}
