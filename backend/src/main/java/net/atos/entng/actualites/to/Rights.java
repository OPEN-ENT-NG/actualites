package net.atos.entng.actualites.to;

import java.util.*;
import java.util.stream.Collectors;

import fr.wseduc.webutils.security.ActionType;
import fr.wseduc.webutils.security.SecuredAction;

import static net.atos.entng.actualites.to.Rights.ResourceType.INFO;

public class Rights {

    public static final List<String> ALLOWED_THREAD_SHARING_RIGHTS = Arrays
            .asList(/*"read", */"contrib", "manager", "publish"); // read right is not included in response
    public static final List<String> ALLOWED_INFO_SHARING_RIGHTS = Collections.singletonList(/*"read", */"comment"); // read right is not included in response

    private final Set<SecuredAction> actions;
    private final ResourceType resourceType;


    public Rights(Set<SecuredAction> actions, ResourceType resourceType) {
        this.actions = actions;
        this.resourceType = resourceType;
    }

    public static Rights fromRawRights(Map<String, SecuredAction> securedActions,
                                       List<String> rawRights,
                                       boolean isOwner,
                                       ResourceType resourceType) {
        final Set<SecuredAction> actions = new HashSet<>();
        for (SecuredAction action: securedActions.values()) {
            if (rawRights.contains(action.getRight())
                    || isOwner
                    || rawRights.contains(action.getRight().replaceAll("\\.", "-"))) {
                actions.add(action);
            }
        }
        return new Rights(actions, resourceType);
    }

    public boolean isSharingRight(SecuredAction action) {
		if (action == null || action.getDisplayName() == null || !ActionType.RESOURCE.name().equals(action.getType())) {
			return false;
		}
        final int idx = action.getDisplayName().lastIndexOf('.');
        if (idx < 0) {
            return false;
        }
		final String sharingType = action.getDisplayName().substring(idx + 1);
		return resourceType == INFO ? ALLOWED_INFO_SHARING_RIGHTS.contains(sharingType) :
                        ALLOWED_THREAD_SHARING_RIGHTS.contains(sharingType);
	}

    public Set<String> getShareDisplayNames() {
        return actions.stream()
                .filter(this::isSharingRight)
                .map(SecuredAction::getDisplayName)
                .collect(Collectors.toSet());
    }

    public enum ResourceType {
        INFO,
        THREAD;
    }

}
