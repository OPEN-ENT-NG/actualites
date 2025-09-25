package net.atos.entng.actualites.controllers.v1;

import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import net.atos.entng.actualites.Actualites;
import net.atos.entng.actualites.controllers.CommentController;
import net.atos.entng.actualites.controllers.InfoController;
import net.atos.entng.actualites.filters.InfoFilter;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;

public class CommentControllerV1 extends ControllerHelper {

    private final CommentController commentController;
    private final InfoController infoController;
    public static final String ROOT_RIGHT = "net.atos.entng.actualites.controllers.CommentController";

    public CommentControllerV1(CommentController commentController, InfoController infoController) {
        this.commentController = commentController;
        this.infoController = infoController;
    }

    @Get("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID + "/comments")
    @ApiDoc("Comment : Get info's comments")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "info.read", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|getInfoComments")
    public void getInfoTimeline(HttpServerRequest request) {
        infoController.getInfoComments(request);
    }

    @Post("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID + "/comments")
    @ApiDoc("Comment : Add a comment to an Info by info id")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "info.comment", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|comment")
    public void createComment(HttpServerRequest request) {
        commentController.comment(request);
    }

    @Put("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID + "/comments/:id")
    @ApiDoc("Comment : modify a comment of an Info by info and comment id")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "info.comment", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|updateComment")
    public void updateComment(HttpServerRequest request) {
        commentController.updateComment(request);
    }

    @Delete("/api/v1/infos/:" + Actualites.INFO_RESOURCE_ID + "/comments/:id")
    @ApiDoc("Comment : delete a comment by comment id ")
    @ResourceFilter(InfoFilter.class)
    @SecuredAction(value = "info.comment", type = ActionType.RESOURCE, right = ROOT_RIGHT + "|deleteComment")
    public void deleteComment(HttpServerRequest request) {
        commentController.deleteComment(request);
    }

}
