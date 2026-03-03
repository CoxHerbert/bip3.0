FROM harbor.eastwinbip.com/yudao/node:22-slim AS builder

# --max-old-space-size
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV TZ=Asia/Shanghai

RUN npm i -g corepack

WORKDIR /app

# copy package.json and pnpm-lock.yaml to workspace
COPY . /app

# 安装依赖
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build --filter=\!./docs

RUN echo "Builder Success 🎉"

FROM harbor.eastwinbip.com/yudao/nginx:stable-alpine AS production

# 配置 nginx
RUN echo "types { application/javascript js mjs; }" > /etc/nginx/conf.d/mjs.conf \
    && rm -rf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html

# 复制 nginx 配置
# 复制 nginx 配置模板
COPY --from=builder /app/scripts/deploy/nginx.conf /etc/nginx/nginx.conf.template

# 设置默认环境变量
ENV BACKEND_HOST="http://yudao-server:48080"

EXPOSE 8080

# 启动 nginx，使用 envsubst 替换变量
# 注意: 只替换 ${BACKEND_HOST}，避免替换 $uri, $host 等 Nginx 内置变量
CMD ["/bin/sh", "-c", "envsubst '$BACKEND_HOST' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]
