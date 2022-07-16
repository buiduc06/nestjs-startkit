# Setup without docker

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Setup with docker

## Running the app

```bash
# run container
$ docker-compose up -d
```

# Commands

## Gen commands

```bash
#gen module
nest g module auth

#gen controller
nest g controller auth

#gen service
nest g service auth
```

## Seeder

```bash
# fake ambassadors records
npm run seed:ambassadors

# fake products records
npm run seed:products

# fake orders records
npm run seed:orders

# fake rankings
npm run rankings
```

## Lưu ý khi test API

- Sử dụng phiên bản Postman dc cài đặt trên máy tính (có hỗ trợ get cookie)
- không được dùng bản postman extension

## Services / Features ...

- [x] Docker
- [x] Mysql
- [x] typeORM
- [x] Redis
- [x] MailHog
- [x] Stripe Gateway
- [x] Event
- [x] Seeder
- [x] Logging
- [x] .....

## URLs

```bash
# MailHog
http://localhost:8025/

# API
http://localhost:3000/

```
