<template>
  <div class="comp-personal-information" v-loading="loading">
    <div class="info-wrap">
      <div class="info-wrap-left">
        <div class="info-wrap-left-top">
          <img class="avatar" :src="handleAvatar(userInfo.avatar)" />
          <div class="info-wrap-left-top-right">
            <div class="real-name">
              {{ userInfo.realName || '-' }}
              <span
                class="wechat-bind"
                :class="{
                  isBind: userDetail.bindWx,
                }"
                @click="handleOpenWxBind"
              >
                <img src="/img/desk/wechat.svg" alt="" />
                {{ userDetail.bindWx ? '已绑定' : '未绑定' }}
              </span>
            </div>
            <div class="dept-name">
              {{ userInfo.deptName || '-' }}
            </div>
          </div>
        </div>
        <div class="user-sign" @click="doAction('sign')">
          <el-icon class="animate__rotateIn"><RefreshRight /></el-icon>
          {{ sentence || '-' }}
        </div>
      </div>

      <div class="weather" @click="doAction('weather')">
        <span class="weather-info">
          <img
            v-if="weatherImg"
            class="weather-img"
            :src="weatherImg"
            alt=""
            :onerror="loadImgError"
            srcset=""
          />
          <div class="weather-text">
            {{ userDetail.weather || '-' }}
          </div>
        </span>
        <span class="address">
          <span class="addr"> {{ userDetail.adressName || '-' }} </span
          ><span class="temp"> {{ userDetail.temperature || '-' }}</span
          >°C
        </span>
      </div>
    </div>
    <div class="integral-wrap">
      <div class="row">
        <div class="integral-data">
          <img src="/img/desk/生日.svg" alt="" />
          生日关怀
          <div class="value">{{ userDetail.reminderCount || 0 }}</div>
        </div>
        <div class="view-details" @click="show = true">
          查看明细<el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      <div class="row">
        <div class="integral-data">
          <img src="/img/desk/积分.svg" alt="" />
          当前积分
          <div class="value">{{ userDetail.points || 0 }}</div>
        </div>
        <div class="view-details">
          查看明细<el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <div class="attendance-wrap">
      <div class="monthly-group">
        <div class="item">
          本月请假天数
          <div class="item-count">{{ userDetail.leaveDateCount || 0 }}</div>
        </div>
        <div class="item">
          本月出差天数
          <div class="item-count">{{ userDetail.travelDateCount || 0 }}</div>
        </div>
        <div class="item">
          本月加班
          <div class="item-count">{{ userDetail.overDateCount || 0 }}小时</div>
        </div>
      </div>
      <div class="punch-card-title">今日打卡明细</div>
      <div class="punch-card-group">
        <div
          class="item-dete"
          v-for="(date, index) in userDetail?.punchCardDetail || []"
          :key="index"
        >
          {{ date }}
        </div>
      </div>
    </div>
    <BirthdayReminderDialog v-model="show" @success="getData" />
    <WxBindDialog v-model:visible="open" :payload="userDetail" @success="getData" />
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { throttle } from 'lodash';
import Api from '@/api';
import BirthdayReminderDialog from './BirthdayReminderDialog.vue';
import WxBindDialog from './WxBindDialog.vue';

const { proxy } = getCurrentInstance();

const compData = reactive({
  loading: false,
  userDetail: {},
  sentence: '',
  weatherImg: null,
  localUrl: '',
  show: false,
  localPosition: {},
  open: false,
});
const { loading, userDetail, sentence, weatherImg, localUrl, show, localPosition, open } =
  toRefs(compData);

const userInfo = computed(() => proxy.$store.getters.userInfoAll);

const getData = () => {
  loading.value = true;
  Api.desk.home
    .getUserInfo(localPosition.value)
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        userDetail.value = data;
        weatherImg.value = `https://static.eastwinbip.com/static/weather/${userDetail.value?.weatherCode}.svg`;
        localUrl.value = `/img/weather_pic/${
          /^[dn]/.test(userDetail.value?.weatherCode || '') ? '' : 'n'
        }${userDetail.value?.weatherCode}.png`;
      }
      loading.value = false;
    })
    .catch(err => {
      console.error(err);
      loading.value = false;
    });
};

const loadImgError = () => {
  weatherImg.value = localUrl.value;
};

const getLocal = () => {
  localPosition.value = { lng: '113.83', lat: '23.02' };
  getData();
};

const getRandomSentence = () => {
  Api.desk.home
    .getRandomSentence()
    .then(res => {
      const { code, data } = res.data;
      if (code === 200) {
        sentence.value = data;
      }
    })
    .catch(err => {
      console.error(err);
    });
};

const doAction = throttle(action => {
  if (action === 'sign') {
    getRandomSentence();
  } else if (action === 'weather') {
    getLocal();
  }
}, 1000);

const handleAvatar = avatar => {
  if (avatar === '/img/bg/img-logo.png' || !avatar) {
    return 'https://static.eastwinbip.com/static/image/logo.png';
  } else {
    return avatar;
  }
};

function handleOpenWxBind() {
  if (userDetail.value?.bindWx) return;
  open.value = true;
}

onMounted(() => {
  getRandomSentence();
  getLocal();
});
</script>
<style lang="scss" scoped>
.comp-personal-information {
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  border-radius: 12px;
  background: linear-gradient(346deg, rgba(247, 132, 49, 0) 0%, rgba(247, 132, 49, 0.25) 100%);
  margin-bottom: 16px;
  .info-wrap {
    display: flex;
    align-items: center;
    .info-wrap-left {
      display: flex;
      flex-direction: column;
      flex: 1;
      &-top {
        display: flex;
        width: 100%;
        .avatar {
          margin-right: 8px;
          width: 48px;
          height: 48px;
          border-radius: 36px;
          background-color: #fff;
          overflow: hidden;
        }
        &-right {
          flex: 1;
          .real-name {
            display: flex;
            align-items: center;
            gap: 5px;
            font-family: Source Han Sans CN, Source Han Sans CN;
            font-weight: 400;
            font-size: 14px;
            color: #333333;
            line-height: 16px;
            text-align: left;
            font-style: normal;
            text-transform: none;
          }
          .wechat-bind {
            display: flex;
            align-items: center;
            font-weight: 400;
            font-size: 12px;
            color: red;
            line-height: 16px;
            cursor: pointer;
            &.isBind {
              color: #848488;
            }
          }
          .dept-name {
            display: flex;
            margin-top: 5px;
            font-weight: 400;
            font-size: 12px;
            color: #848488;
            line-height: 16px;
          }
        }
      }

      .user-sign {
        margin: 10px 0;
        flex: 1;
        font-weight: bold;
        font-size: 14px;
        color: #333333;
        line-height: 16px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
      }
    }
    .weather {
      margin-top: -10px;
      margin-right: -3px;
      padding: 0 0 3px 22px;
      position: relative;
      font-weight: 400;
      font-size: 12px;
      color: #333333;
      cursor: pointer;
      &-info {
        .weather-img {
          width: 55px;
          height: 55px;
        }
      }
    }
  }
  .integral-wrap {
    padding: 0 7px;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.75);
    border-radius: 12px;
    border: 2px solid #ffffff;
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      img {
        margin-right: 5px;
      }
    }
    .integral-data {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 14px;
      color: #333333;
      .value {
        margin-left: 16px;
        font-weight: bold;
        font-size: 20px;
        color: #f78431;
      }
    }
    .view-details {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 12px;
      color: #848488;
      line-height: 12px;
      text-align: right;
      font-style: normal;
      text-transform: none;
      user-select: none;
      cursor: pointer;
    }
  }
  .attendance-wrap {
    display: flex;
    flex-direction: column;
    padding-top: 10px;
    height: 184px;
    background: rgba(255, 255, 255, 0.75);
    border-radius: 12px;
    border: 2px solid #ffffff;
    .monthly-group {
      display: flex;
      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        font-weight: 400;
        font-size: 14px;
        color: #666666;
        &-count {
          margin-top: 12px;
          font-weight: bold;
          font-size: 20px;
          color: #333333;
          line-height: 20px;
        }
      }
    }
  }
  .punch-card-title {
    padding: 15px 10px;
    font-weight: 600;
    font-size: 14px;
    color: #333333;
    line-height: 14px;
  }
  .punch-card-group {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    padding: 15px;
    padding-top: 0;
    overflow: hidden;
    .item-dete {
      width: 33%;
      height: 50%;
      font-weight: 400;
      font-size: 12px;
      color: #848488;
    }
  }

  .address {
    .addr {
      font-size: 12px;
      font-weight: bold;
      margin-right: 4px;
    }

    .temp {
      font-size: 12px;
      font-weight: bold;
    }
  }
}
</style>
