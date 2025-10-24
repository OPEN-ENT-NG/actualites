package net.atos.entng.actualites.controllers.v1;

import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import net.atos.entng.actualites.controllers.ThreadController;
import net.atos.entng.actualites.filters.ThreadFilter;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.SuperAdminFilter;

import static net.atos.entng.actualites.Actualites.THREAD_RESOURCE_ID;

public class ThreadControllerV1 extends ControllerHelper {

    private final ThreadController threadController;
    public static final String ROOT_RIGHT = "net.atos.entng.actualites.controllers.ThreadController";

    public ThreadControllerV1(ThreadController threadController) {
        this.threadController = threadController;
    }

    @Get("/api/v1/threads")
    @ApiDoc("Get all threads ")
    @SecuredAction(value = "actualites.threads.list", right = ROOT_RIGHT + "|listThreads")
    public void getThreads(HttpServerRequest request) {
        threadController.listThreadsV2(request);
    }

    @Get("/api/v1/threads/:" + THREAD_RESOURCE_ID)
    @ApiDoc("Get a thread by Id")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.contrib", right = ROOT_RIGHT + "|getThread", type = ActionType.RESOURCE)
    public void getThreadById(HttpServerRequest request) {
        threadController.getThread(request);
    }

    @Post("/api/v1/threads")
    @ApiDoc("Create a new thread")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "actualites.create", right = ROOT_RIGHT + "|createThread")
    public void createThread(HttpServerRequest request) {
        threadController.createThread(request);
    }

    @Put("/api/v1/threads/:" + THREAD_RESOURCE_ID)
    @ApiDoc("Update thread by id")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|updateThread", type = ActionType.RESOURCE)
    public void updateThread(HttpServerRequest request) {
        threadController.updateThread(request);
    }

    @Delete("/api/v1/threads/:" + THREAD_RESOURCE_ID)
    @ApiDoc("Delete thread by id")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|deleteThread", type = ActionType.RESOURCE)
    public void deleteThread(HttpServerRequest request) {
        threadController.deleteThread(request);
    }

    @Get("/api/v1/threads/:id/shares")
    @ApiDoc("Get thread's shares")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|shareThread", type = ActionType.RESOURCE)
    public void getThreadShares(HttpServerRequest request) {
        threadController.shareThread(request);
    }

    @Put("/api/v1/threads/:id/shares")
    @ApiDoc("Update thread's shares")
    @ResourceFilter(ThreadFilter.class)
    @SecuredAction(value = "thread.manager", right = ROOT_RIGHT + "|shareResource", type = ActionType.RESOURCE)
    public void updateThreadShares(HttpServerRequest request) {
        threadController.shareResource(request);
    }

    @Post("/api/v1/threads/tasks")
    @ApiDoc("Get thread's shares")
    @ResourceFilter(SuperAdminFilter.class)
    @SecuredAction(value = "", right = ROOT_RIGHT + "|admcTask", type = ActionType.RESOURCE)
    public void linkThread(HttpServerRequest request) {
        threadController.admcTask(request);
    }
}
