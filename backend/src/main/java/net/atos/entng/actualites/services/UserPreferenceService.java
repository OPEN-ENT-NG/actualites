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
     * Filter out IDs of users preferring not to see a thread.
     * 
     * @param threadId the thread ID
     * @param ids list of user IDs to check
     * @return A filtered list of user IDs
     */
    Future<List<String>> removeUsersNotSeeingThread(final String threadId, List<String> ids);

    /**
     * Retrieve all distinct user IDs that have stored preferences.
     *
     * @return list of user IDs
     */
    Future<List<String>> getUsersWithPreferences();

    /**
     * Delete all preferences for the given list of users.
     *
     * @param userIds user IDs whose preferences must be removed
     * @return completed future on success
     */
    Future<Void> deletePreferencesForUsers(List<String> userIds);
}
