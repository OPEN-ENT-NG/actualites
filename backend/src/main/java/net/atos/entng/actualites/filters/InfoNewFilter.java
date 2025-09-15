package net.atos.entng.actualites.filters;

import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.user.UserInfos;

import java.util.Arrays;

public class InfoNewFilter implements ResourcesProvider {

    @Override
    public void authorize(HttpServerRequest resourceRequest, Binding binding, UserInfos user, Handler<Boolean> handler) {
        System.out.println(Arrays.stream(binding.getArguments()).reduce(String::concat));
        handler.handle(true);
    }
}
