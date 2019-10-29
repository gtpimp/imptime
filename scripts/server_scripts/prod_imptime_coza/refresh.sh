set -e
/home/foodlink_docker/maintenance_on.sh

sudo cp -R /home/foodlink_docker/configurations/staging/external_config /home/foodlink_docker/src/foodlink/deploy/deployer_temp/docker_compose
set +e
/home/foodlink_docker/src/foodlink/deploy/deployer_temp/docker_compose/down.sh
set -e

cd /home/foodlink_docker
./all_up.sh
./maintenance_off.sh

