package net.atos.entng.actualites.filters;

public interface RightConstants {
    
    // Thread Contrib: can view thread and create draft/pending infos
    String THREAD_CONTRIB_VALUE = "thread.contrib";
    String THREAD_CONTRIB_RIGHT = "net-atos-entng-actualites-controllers-ThreadController|contrib";
    
    // Thread Manager: can update, delete, share thread
    String THREAD_MANAGER_VALUE = "thread.manager";
    String THREAD_MANAGER_RIGHT = "net-atos-entng-actualites-controllers-ThreadController|manager";
        
    // Info Read: can view published infos
    String INFO_READ_VALUE = "info.read";
    String INFO_READ_RIGHT = "net-atos-entng-actualites-controllers-InfoController|read";
    
    // Info Comment: can comment on infos
    String INFO_COMMENT_VALUE = "info.comment";
    String INFO_COMMENT_RIGHT = "net-atos-entng-actualites-controllers-CommentController|comment";
    
    // Thread Publish: can publish/unpublish infos (shares Thread's publish right)
    String THREAD_PUBLISH_VALUE = "thread.publish";
    String THREAD_PUBLISH_RIGHT = "net-atos-entng-actualites-controllers-InfoController|publish";
        
    @Deprecated
    String CREATE_RIGHT_DRAFT = "net-atos-entng-actualites-controllers-InfoController|createDraft";
    String RIGHT_MANAGE = "net-atos-entng-actualites-controllers-ThreadController|updateThread";
    @Deprecated
    String RIGHT_PUBLISH = "net-atos-entng-actualites-controllers-InfoController|publish";
    @Deprecated
    String RIGHT_CONTRIB = "net-atos-entng-actualites-controllers-InfoController|submit";

}
