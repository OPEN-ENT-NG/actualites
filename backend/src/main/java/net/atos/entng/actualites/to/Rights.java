package net.atos.entng.actualites.to;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import fr.wseduc.webutils.security.ActionType;
import fr.wseduc.webutils.security.SecuredAction;

public class Rights {

    public static final List<String> ALLOWED_SHARING_RIGHTS = Arrays
            .asList(/*"read", */"contrib", "manager", "publish", "comment"); // read right is not included in response

    private final Set<SecuredAction> actions;

    public Rights(Set<SecuredAction> actions) {
        this.actions = actions;
    }

    public static Rights fromRawRights(Map<String, SecuredAction> securedActions, List<String> rawRights) {
        final Set<SecuredAction> actions = new HashSet<>();
        for (SecuredAction action: securedActions.values()) {
            if (rawRights.contains(action.getName()) || rawRights.contains(action.getName().replaceAll("\\.", "-"))) {
                actions.add(action);
            }
        }
        return new Rights(actions);
    }

    public static boolean isSharingRight(SecuredAction action) {
		if (action == null || action.getDisplayName() == null || !ActionType.RESOURCE.name().equals(action.getType())) {
			return false;
		}
        final int idx = action.getDisplayName().lastIndexOf('.');
        if (idx < 0) {
            return false;
        }
		final String sharingType = action.getDisplayName().substring(idx + 1);
		return ALLOWED_SHARING_RIGHTS.contains(sharingType);
	}

    public Set<String> getShareDisplayNames() {
        return actions.stream()
                .filter(Rights::isSharingRight)
                .map(SecuredAction::getDisplayName)
                .collect(Collectors.toSet());
    }

}
