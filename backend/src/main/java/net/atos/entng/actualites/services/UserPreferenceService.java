package net.atos.entng.actualites.services;

import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import net.atos.entng.actualites.to.Preferences;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.Map;

public interface UserPreferenceService {
    /**
     * Update / insert all user preference in preferences for the user
     * @param preferences list of visible preferences for thread
     * @param userInfo the user
     * @param handler for rendering success or error
     */
    void updateUserPreference(Preferences preferences, UserInfos userInfo, Map<String, SecuredAction> securedActions,
                              Handler<Either<String, Void>> handler);


    Future<Boolean> hasThreadPreference(UserInfos userInfo);

    /**
     * Filter out IDs of users prefering not to see a thread.
     * 
     * @param threadId the thread ID
     * @param ids list of users ID to check
     * @return A filtered list of users ID
     */
    Future<List<String>> removeUsersNotSeeingThread(final String threadId, List<String> ids);
}
