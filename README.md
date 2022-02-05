# Оглавление
1. [Особенности запуска комплекса на локальной машине](#1)
2. [Деплой](#2)

# Особенности запуска комплекса на локальной машине:

В этом формате используется бэкэнд, БД запущенная локально или в докере, и nginx с особыми настройками в файле `nginx_conf.d/default.conf`:
- бэкэнд запущен нативно на порту 8090

- для запуска nginx используется конфигурация
```
location /v1 {
    proxy_pass http://host.docker.internal:8091/v1; # use for macos local development, when backend is natively run
```

- nginx запускается отдельно (важны абсолютные пути -v):
```
docker run -it --rm -d -p 80:80 --network="bridge" -name web_sample -v /Users/yzabiyaka/SPA/vuefirst/nginx_conf.d:/etc/nginx/conf.d -v /Users/yzabiyaka/SPA/vuefirst/frontend:/usr/share/nginx/html  nginx
```

- в настройках фронтэнда в env_file_back_and_front указывается
```
FRONTEND_BACKEND_HOSTANDPORT=localhost:80
```
настройки применяются скриптом
```
./shell_scripts/convert_kv2json.sh ./env_file_back_and_front > ./frontend/config_env_file.js
```

# Деплой

## Скачивание репозитория

- выберете папку на сервере
- `git clone https://github.com/yurizabiyaka/hla22.git`
- `git checkout master`

## Первоначальная настройка

- сделайте исполняемыми файлы `start_with_migrations`, `stop_all`

- настройте файл конфигурации фронта и бэкэнда `env_file_back_and_front`:

|parameter name | description |
| ----------- | ----------- |
| <b> backend properties </b> |
|DB_HOSTANDPORT | database e.g. *localhost:3306* <br> if *docker-compose* is used, specify <b>mariadb</b> db service name here |
|DB_USER | *dbuser* |
|DB_PASSWORD | *dbpass* |
|DB_NAME | *labonedb* |
|CORS_ORIGIN | requests from that origin will be allowed by a browser. E.g. if our frontend is running on https host lab-one.ru and port is 80, the setting should be *https://lab-one.ru:80*. This does not corresponds to backend port, but the backend should refer this origin in Access-Control-Allow-Origin header for the browser making the request |
|LISTEN_HOSTANDPORT | this is where backend listens to requests |
| <b> frontend parameters </b> |
|FRONTEND_BACKEND_PROTOCOL | e.g. *http* <br> the protocol used by frontend SPA to make API requests |
|FRONTEND_BACKEND_HOSTANDPORT | e.g. *localhost:80* <br> this is the backend host and port |
|FRONTEND_BACKEND_API_PREFIX | e.g. */v1* <br> the backend API calls suffix |

- настройте файл конфигурации nginx `nginx_conf.d/default.conf`. В секцию proxy_pass необходимо вписать имя хоста контейнера, с которым он зарегистрирован в сети. Это то самое имя, которое указано после ключа `--name` в скрипте запуска `./start_with_migrations` (или `./start_wo_migrations`)
```
server {
    ...
    server_name  lab-one.ddns.net;
    ...
    location /v1 {
        proxy_pass http://lab_one_backend_run:8090/v1;
```

## Обновление и деплой

- `git stash push` для сохранения изменений в конфигурационном файле (и прав на исполняемые файлы)

- `git pull`

- `git stash pop`

- если сервисы запущены, остановите их командой `./stop_all`

- перезапуск включает 
    - преобразование файла `env_file_back_and_front` в конфиги для бэкэнда и фронтэнда
    - сборку образа *lab_one_backend* соответствующим `Dockerfile` из папки бэкэнда; запуск БД - через `docker-compose up --build`
    - миграцию БД
    - запуска контейнера с бэкэндом через `docker-compose run`
    - запуск nginx через `docker-compose run`

    <br>Перезапуск осуществляется скриптом `./start_with_migrations`
    
    Есть специальный скрипт `./start_wo_migrations` для запуска всего без миграций, но выигрыш по времени не велик.

