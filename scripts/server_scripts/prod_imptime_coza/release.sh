/home/foodlink_docker/maintenance_on.sh

if [ `whoami` != 'foodlink' ]; then
    echo "Must be foodlink user"
    exit
fi

BRANCH=staging

cd /home/foodlink_docker/src/foodlink/deploy/

set +e
./deployer_temp/docker_compose/down.sh
set -e

eval `ssh-agent`
ssh-add ~/.ssh/foodlink2

git reset --hard HEAD
git pull origin ${BRANCH}
./run_deployer.sh --clean "y" --cmd "fab host_local branch:${BRANCH} scripts_foldername:staging sample_config_foldername:sample build"

cd /home/foodlink_docker
./refresh.sh

./all_up.sh

/home/foodlink_docker/maintenance_off.sh
