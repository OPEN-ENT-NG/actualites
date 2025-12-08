DELETE FROM actualites.thread_shares
    WHERE action in ('net-atos-entng-actualites-controllers-InfoController|shareInfoSubmit','net-atos-entng-actualites-controllers-InfoController|shareInfoRemove',
                     'net-atos-entng-actualites-controllers-ThreadController|shareThreadSubmit','net-atos-entng-actualites-controllers-ThreadController|shareThreadRemove') ;