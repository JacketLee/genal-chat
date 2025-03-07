<template>
  <div class="room">
    <div v-for="(chat, index) in chatArr" :key="(chat.userId || chat.groupId) + index">
      <div
        v-if="chat.groupId"
        class="room-card"
        :class="{ active: activeRoom && activeRoom.groupId === chat.groupId }"
        @click="changeActiveRoom(chat)"
      >
        <img class="room-card-type" src="~@/assets/group.png" alt="" />
        <div class="room-card-message">
          <div class="room-card-name">{{ chat.groupName }}</div>
          <div class="room-card-new" v-if="chat.messages">
            <div
              class="text"
              v-html="_parseText(chat.messages[chat.messages.length - 1].content)"
              v-if="chat.messages[chat.messages.length - 1].messageType === 'text'"
            ></div>
            <div class="image" v-if="chat.messages[chat.messages.length - 1].messageType === 'image'">[图片]</div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="room-card"
        :class="{ active: activeRoom && !activeRoom.groupId && activeRoom.userId === chat.userId }"
        @click="changeActiveRoom(chat)"
      >
        <img class="room-card-type" :src="friendGather[chat.userId].avatar" alt="" />
        <div class="room-card-message">
          <div class="room-card-name">{{ chat.username }}</div>
          <div class="room-card-new" v-if="chat.messages">
            <div
              class="text"
              v-html="_parseText(chat.messages[chat.messages.length - 1].content)"
              v-if="chat.messages[chat.messages.length - 1].messageType === 'text'"
            ></div>
            <div class="image" v-if="chat.messages[chat.messages.length - 1].messageType === 'image'">[图片]</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
const chatModule = namespace('chat');
import { parseText } from '@/utils/common';

@Component
export default class GenalRoom extends Vue {
  @chatModule.State('activeRoom') activeRoom: Group & Friend;
  @chatModule.Getter('groupGather') groupGather: GroupGather;
  @chatModule.Getter('friendGather') friendGather: FriendGather;
  chatArr: Array<Group | Friend> = [];

  @Watch('groupGather', { deep: true })
  changeGroupGather() {
    this.sortChat();
  }

  @Watch('friendGather', { deep: true })
  changeFriendGather() {
    this.sortChat();
  }

  sortChat() {
    this.chatArr = [];
    let groups = Object.values(this.groupGather);
    let friends = Object.values(this.friendGather);
    this.chatArr = [...groups, ...friends];
    // 对聊天窗进行排序(根据最新消息时间)
    this.chatArr = this.chatArr.sort((a: Group | Friend, b: Group | Friend) => {
      if (a.messages && b.messages) {
        // @ts-ignore
        return b.messages[b.messages.length - 1].time - a.messages[a.messages.length - 1].time;
      }
      if (a.messages) {
        return -1;
      }
      return 1;
    });
  }

  changeActiveRoom(activeRoom: User & Group) {
    this.$emit('setActiveRoom', activeRoom);
  }

  _parseText(text: string) {
    return parseText(text);
  }
}
</script>
<style lang="scss" scoped>
.room {
  height: calc(100% - 60px);
  overflow: auto;
  .room-card {
    min-height: 60px;
    display: flex;
    align-items: center;
    background-color: rgba(54, 50, 50, 0.1);
    padding: 5px 10px;
    text-align: left;
    transition: all 0.2s linear;
    cursor: pointer;
    &:hover {
      background-color: rgb(0, 0, 0, 0.3);
    }
    &.active {
      background-color: rgb(0, 0, 0, 0.3);
    }
    .room-card-type {
      width: 35px;
      height: 35px;
      margin-right: 5px;
      border-radius: 50%;
    }
    .room-card-message {
      flex: 1;
      display: flex;
      width: 75%;
      flex-direction: column;
      .room-card-name {
        overflow: hidden; //超出的文本隐藏
        text-overflow: ellipsis; //溢出用省略号显示
        white-space: nowrap; //溢出不换行
      }
      .room-card-new {
        > * {
          overflow: hidden; //超出的文本隐藏
          text-overflow: ellipsis; //溢出用省略号显示
          white-space: nowrap; //溢出不换行
        }
        color: gray;
        font-size: 14px;
      }
    }
  }
}
</style>
