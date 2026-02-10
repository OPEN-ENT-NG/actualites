package net.atos.entng.actualites.controllers.v1;

import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.http.HttpServerRequest;
import net.atos.entng.actualites.services.UserPreferenceService;
import net.atos.entng.actualites.to.Preferences;
import net.atos.entng.actualites.to.ThreadPreferenceExists;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.AdminFilter;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.voidResponseHandler;

public class UserPreferenceController extends ControllerHelper {

	private UserPreferenceService userPreferenceService;

	public UserPreferenceController(UserPreferenceService userPreferenceService) {
		this.userPreferenceService = userPreferenceService;
	}

    @Put("/api/v1/me/thread-preferences")
    @ApiDoc("Preference of user for thread visibility")
	@ResourceFilter(AdminFilter.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void updateThreadPreference(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			RequestUtils.bodyToClass(request, Preferences.class)
					.onSuccess( prefs -> userPreferenceService.updateUserPreference(prefs, user, securedActions, voidResponseHandler(request)))
					.onFailure(th -> {
						Renders.log.error("Error while setting user preferences of " + user.getUserId(), th);
						renderError(request);
					});
		});
	}

	@Get("/api/v1/me/thread-preferences/exists")
	@ApiDoc("Give information of the existence of thread preference for the user")
	@ResourceFilter(AdminFilter.class)
	@SecuredAction(value = "", type = ActionType.RESOURCE)
	public void isPreferenceExists(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, user -> {
			userPreferenceService.hasThreadPreference(user)
					.onSuccess(result -> {
						render(request, new ThreadPreferenceExists(result));
					}).onFailure(t -> {
						Renders.log.error("Error while testing existence of user preferences of " + user.getUserId(), t);
						renderError(request);
					});
		});
	}


}
