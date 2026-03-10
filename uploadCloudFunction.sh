#!/bin/bash

# 微信云函数上传脚本
# 使用方法：./uploadCloudFunction.sh [envId]

ENV_ID=${1:-"cloud1-0gu9re7s846e6224"}
PROJECT_PATH="/Users/qihao/WeChatProjects/miniprogram-1"

echo "开始安装云函数依赖..."

# 安装所有云函数的依赖（只安装生产环境）
for func in getUserInfo quickstartFunctions syncReadingRecords syncReviewTasks; do
    echo "正在安装 $func 的依赖..."
    cd "$PROJECT_PATH/cloudfunctions/$func" && npm install --omit=dev
done

echo ""
echo "依赖安装完成！"
echo "请在微信开发者工具中右键点击云函数选择【上传并部署：云端安装依赖】"
echo "或者使用以下命令逐个上传云函数："
echo ""
echo "wx cloud functions deploy --e $ENV_ID --n getUserInfo --r --project $PROJECT_PATH"
echo "wx cloud functions deploy --e $ENV_ID --n quickstartFunctions --r --project $PROJECT_PATH"
echo "wx cloud functions deploy --e $ENV_ID --n syncReadingRecords --r --project $PROJECT_PATH"
echo "wx cloud functions deploy --e $ENV_ID --n syncReviewTasks --r --project $PROJECT_PATH"