package net.atos.entng.actualites.filters;

import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import net.atos.entng.actualites.services.UserPreferenceService;
import net.atos.entng.actualites.services.impl.UserPreferenceServiceImpl;
import org.entcore.common.http.filter.AdminFilter;
import org.entcore.common.user.UserInfos;

public class UserPreferencesFilter  extends AdminFilter {

    private final UserPreferenceService userPreferenceService = new UserPreferenceServiceImpl(null);

    @Override
    public void authorize(HttpServerRequest resourceRequest, Binding binding, UserInfos user, Handler<Boolean> handler) {
        super.authorize(resourceRequest, binding, user, h -> {
            if  (h.booleanValue()) {
                handler.handle(true);
                return;
            }
            userPreferenceService.hasThreadPreference(user)
                    .onSuccess(handler)
                    .onFailure( e -> handler.handle(false));
        });
    }
}
