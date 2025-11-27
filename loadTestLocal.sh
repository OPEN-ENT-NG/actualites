ROOT_URL=http://172.17.0.1:8090 DATA_ROOT_PATH=/home/k6/data \
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=test-report.html \
ADMC_LOGIN=tom.mate \
ADMC_PASSWORD=password  \
DEFAULT_PASSWORD=password \
ENVIRONMENT=NotLocal \
k6 --compatibility-mode=base run ./backend/src/test/js/loadtest/scenarios/widget-averageLoad.ts
