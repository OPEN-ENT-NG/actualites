package net.atos.entng.actualites.filters;

import org.entcore.common.http.filter.expression.ExpressionEvaluatorContext;

public class InfoNewFilter  {

    public void hasRight(ExpressionEvaluatorContext context) {
        System.out.println("Filter with biding:" + context);
        context.handler.handle(true);
    }
}
