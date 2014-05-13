routes.define(function($routeProvider){
    $routeProvider
        .when('/thread/:threadId', {
            action: 'viewThread'
        })
});

/* Edition Controller */
function ActualitesEditionController($injector, $scope, template, route){

    this.initialize = function(){

        route({
            viewThread: function(param){
                $scope.selectThread(new Thread({_id: param.threadId}));
                $scope.currentThread.open();
            }
        });

        // Dependencies
        $scope.template = template;

        // Variables
        $scope.threads = model.threads.mixed;
        $scope.infos = {};
        $scope.currentThread = {};
        $scope.currentInfo = {};
        $scope.display = {showPanel: false};

        // Default display : first thread
        model.threads.on('mixed.sync', function(){
            $scope.selectThread(model.threads.mixed.first());
        });
    }

    // Thread display
    $scope.selectThread = function(thread){
        $scope.currentThread = thread;
        template.open('thread', 'threads-edit-view');

        // Display mode
        $scope.showInfos();
    }

    $scope.showInfos = function(){
        $scope.currentThread.loadInfos();
        $scope.currentThread.on('loadInfos', function(){
            // Sort by latest modified
            $scope.infos = $scope.currentThread.infos.sortBy(function(info){ 
                return moment() - info.modified; });
            //$scope.$apply("infos");
            $scope.infos.forEach(function(info){
                info.load();
                info.on('change', function(){
                    $scope.$apply("infos");
                });
            });
        });
    }

    // Info display
    $scope.selectInfo = function(info){
        $scope.currentInfo = info;
    }

    $scope.hasCurrentInfo = function(){
        return ($scope.currentInfo instanceof Info);
    }

    // Info Edition
    $scope.infoExists = function(info) {
        return (info._id !== undefined);
    }

    $scope.createInfo = function(info){
        if (info === undefined) {
            // Info creation
            $scope.currentInfo = new Info();
            $scope.currentInfo.status = ACTUALITES_CONFIGURATION.infoStatus.DRAFT;
        }
        else {
            // Info edition
            $scope.currentInfo = info;
        }
        template.open('thread', 'info-edit-form');
    }

    $scope.saveInfo = function(info){
        if (info._id === undefined) {
            // Info creation
            var newInfo = new Info();
            newInfo.create($scope.currentThread, info);
        }
        else {
            // Info edition
            info.save();
        }

        $scope.reloadInfos();
        $scope.cancelEditInfo();
    }

    $scope.publishInfo = function(info){
        info.status = ACTUALITES_CONFIGURATION.infoStatus.PUBLISHED;
        info.save();
        $scope.reloadInfos();
    }

    $scope.unpublishInfo = function(info){
        info.status = ACTUALITES_CONFIGURATION.infoStatus.DRAFT;
        info.save();
        $scope.reloadInfos();
    }

    $scope.deleteInfo = function(info){
        info.remove($scope.currentThread);
        $scope.reloadInfos();
        $scope.cancelEditInfo();
    }

    $scope.cancelEditInfo = function(){
        $scope.currentInfo = {};
        template.open('thread', 'threads-edit-view');
    }

    $injector.invoke(ActualitesAbstractController, this, {
        $scope: $scope,
        template: template,
        route: route
    });

    this.initialize();
}