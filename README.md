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

```
#gen module
nest g module auth

#gen controller
nest g controller auth

#gen service
nest g service auth
```

## Lưu ý khi test API

### Lưu ý khi test API bằng postman: phải sử dụng phiên bản Postman dc vcài đặt trên máy tính (có hỗ trợ get cookie)

### không được dùng bản postman extension
