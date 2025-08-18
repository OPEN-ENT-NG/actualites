import http from 'axios';
import { Behaviours, _, model } from 'entcore';

const actualitesBehaviours = {
    resources: {
        viewThread: {
            right: 'net-atos-entng-actualites-controllers-ThreadController|getThread'
        },
        editThread: {
            right: 'net-atos-entng-actualites-controllers-ThreadController|updateThread'
        },
        deleteThread: {
            right: 'net-atos-entng-actualites-controllers-ThreadController|deleteThread'
        },
        manager: {
            right: 'net-atos-entng-actualites-controllers-ThreadController|deleteThread'
        },
        share: {
            right: 'net-atos-entng-actualites-controllers-ThreadController|shareThread'
        },
        viewInfo: {
            right: 'net-atos-entng-actualites-controllers-InfoController|getInfo'
        },
        contrib: {
            right: 'net-atos-entng-actualites-controllers-InfoController|createDraft'
        },
        createPending: {
            right: 'net-atos-entng-actualites-controllers-InfoController|createPending'
        },
        createPublished: {
            right: 'net-atos-entng-actualites-controllers-InfoController|createPublished'
        },
        updateDraft: {
            right: 'net-atos-entng-actualites-controllers-InfoController|updateDraft'
        },
        updatePending: {
            right: 'net-atos-entng-actualites-controllers-InfoController|updatePending'
        },
        updatePublished: {
            right: 'net-atos-entng-actualites-controllers-InfoController|updatePublished'
        },
        submit: {
            right: 'net-atos-entng-actualites-controllers-InfoController|submit'
        },
        unsubmit: {
            right: 'net-atos-entng-actualites-controllers-InfoController|unsubmit'
        },
        publish: {
            right: 'net-atos-entng-actualites-controllers-InfoController|publish'
        },
        unpublish: {
            right: 'net-atos-entng-actualites-controllers-InfoController|unpublish'
        },
        trash: {
            right: 'net-atos-entng-actualites-controllers-InfoController|trash'
        },
        restore: {
            right: 'net-atos-entng-actualites-controllers-InfoController|restore'
        },
        delete: {
            right: 'net-atos-entng-actualites-controllers-InfoController|delete'
        },
        comment: {
            right: 'net-atos-entng-actualites-controllers-CommentController|comment'
        },
        updateComment: {
            right: 'net-atos-entng-actualites-controllers-CommentController|updateComment'
        },
        deleteComment: {
            right: 'net-atos-entng-actualites-controllers-CommentController|deleteComment'
        },
        getInfoTimeline: {
            right: 'net-atos-entng-actualites-controllers-InfoController|getInfoTimeline'
        }
    },
    workflow: {
        admin: 'net.atos.entng.actualites.controllers.ThreadController|createThread'
    },
    share: {
        overrideDefaultActions: ['info.read', 'info.comment']
    }
};

Behaviours.register('actualites', {
    behaviours: actualitesBehaviours,
    resource: function(resource){
        if (resource !== undefined){
            if (!resource.myRights){
                resource.myRights = {};
            }
            const hasAdmlRightsFor = (behaviour, structureId) => {
                // Adml have rights on these behaviours
                return ['editThread', 'deleteThread', 'manager', 'share'].indexOf(behaviour)>=0 &&
                       model.me.functions &&
                       model.me.functions.ADMIN_LOCAL &&
                       model.me.functions.ADMIN_LOCAL.scope &&
                       model.me.functions.ADMIN_LOCAL.scope.indexOf(structureId)>=0;
            }
            for (var behaviour in actualitesBehaviours.resources){
                if (model.me.hasRight(resource, actualitesBehaviours.resources[behaviour]) 
                    || model.me.userId === resource.owner
                    || hasAdmlRightsFor(behaviour, resource.structure_id)
                    ){
                    if (resource.myRights[behaviour] !== undefined){
                        resource.myRights[behaviour] = resource.myRights[behaviour] && actualitesBehaviours.resources[behaviour];
                    } else {
                        resource.myRights[behaviour] = actualitesBehaviours.resources[behaviour];
                    }
                }
            }
            if(resource.shared && resource.shared.length > 0) {
                resource.shared.forEach(shareInfos =>{
                    for (var behaviour in actualitesBehaviours.resources) {
                        for (var share in shareInfos) {
                            if (share.includes(behaviour) && model.me.userId === shareInfos.userId && shareInfos[share]) {
                                if (resource.myRights[behaviour] !== undefined) {
                                    resource.myRights[behaviour] = resource.myRights[behaviour] && actualitesBehaviours.resources[behaviour];
                                } else {
                                    resource.myRights[behaviour] = actualitesBehaviours.resources[behaviour];
                                }
                            }
                        }
                    }
                });
            }
        }
        return resource;
    },
    workflow: function(){
        var workflow = { };
        var actualitesWorkflow = actualitesBehaviours.workflow;
        for (var prop in actualitesWorkflow){
            if (model && model.me.hasWorkflow(actualitesWorkflow[prop])){
                workflow[prop] = true;
            }
        }

        return workflow;
    },
    share: function() {
        return actualitesBehaviours.share;
    },
    resourceRights: function(){
        return ['read', 'contrib', 'publish', 'manager', 'comment'];
    },

    // Used by component "linker" to load news
    loadResources: function(callback){
        http.get('/actualites/linker/infos').then(function(infos) {
            var infosArray = _.map(infos.data, function(info){
                var threadIcon;
                if (!info.thread_icon) {
                    threadIcon = '/img/icons/glyphicons_036_file.png';
                }
                else {
                    threadIcon = info.thread_icon + '?thumbnail=48x48';
                }
                return {
                    title : info.title + ' [' + info.thread_title + ']',
                    ownerName : info.unsername,
                    owner : info.owner,
                    icon : threadIcon,
                    path : '/actualites#/view/thread/' + info.thread_id + '/info/' + info._id,
                    id : info._id,
                    thread_id : info.thread_id
                };
            });
            this.resources = _.compact(_.flatten(infosArray));
            if (typeof callback === 'function'){
                callback(this.resources);
            }
        }.bind(this));
    }

});