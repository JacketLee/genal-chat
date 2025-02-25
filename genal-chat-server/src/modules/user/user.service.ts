import { Injectable } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { GroupMap } from '../group/entity/group.entity';
import { createWriteStream } from 'fs';
import { join } from 'path'
import { RCode } from 'src/common/constant/rcode';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(GroupMap)
    private readonly groupUserRepository: Repository<GroupMap>,
  ) {}

  async getUser(userId: string) {
    try {
      let data;
      if(userId) {
        data = await this.userRepository.findOne({
          select: ['userId','username','avatar','role','tag','createTime'],
          where:{userId: userId}
        })
        return { msg:'获取用户成功', data }
      }
    } catch(e) {
      return { code: RCode.ERROR , msg:'获取用户失败', data: e }
    }
  }

  async postUsers(userIds: string) {
    try {
      if(userIds) {
        const userIdArr = userIds.split(',');
        const userArr = []
        for(const userId of userIdArr) {
          if(userId) {
            const data = await this.userRepository.findOne({
              select: ['userId','username','avatar','role','tag','createTime'],
              where:{userId: userId}
            })
            userArr.push(data)
          }
        }
        return { msg:'获取用户信息成功', data: userArr}
      }
      return {code: RCode.FAIL, msg:'获取用户信息失败', data: null }
    } catch(e) {
      return { code: RCode.ERROR , msg:'获取用户信息失败', data: e }
    }
  }

  async addUser(user: User) {
    try {
      const isHave = await this.userRepository.find({username: user.username})
      if(isHave.length) {
        return {code: 1, msg:'用户名重复', data: '' }
      }

      const index = Math.round(Math.random()*19 +1)
      user.avatar = `api/avatar/avatar(${index}).png`

      const data = await this.userRepository.save(user)

      await this.groupUserRepository.save({
        userId: data.userId,
        groupId: '阿童木聊天室',
      })
      return { msg:'注册成功', data }
    } catch(e) {
      return { code: RCode.ERROR, msg:'注册失败', data: e }
    }
  }

  async updateUser(userId: string, user: User) {
    try {
      const oldUser = await this.userRepository.findOne({userId: userId})
      if(user.password === oldUser.password) {
        const isHaveName = await this.userRepository.findOne({username: user.username})
        if(isHaveName) {
          return {code: 1, msg:'用户名重复', data: ''}
        }
        await this.userRepository.update(oldUser,user)
        const newUser = await this.userRepository.findOne({userId: userId})
        return { msg:'更新用户信息成功', data: newUser}
      } 
      return {code: RCode.FAIL, msg:'密码错误', data: '' }
    } catch(e) {
      return {code: RCode.ERROR, msg: '更新用户信息失败', data: e }
    }
  }

  async delUser(userId: string) {
    try {
      const data =  await this.userRepository.delete({userId: userId})
      return { msg: '用户删除成功', data}
    } catch(e) {
      return {code: RCode.ERROR, msg:'用户删除失败', data: e}
    }
  }

  async login(user: {username: string, password: string}) {
    try {
      const data = await this.userRepository.findOne({username:user.username, password: user.password})
      if(!data) {
        return {code: 1 , msg:'密码错误', data: ''}
      }
      return { msg:'登录成功', data: data}
    }catch(e) {
      return {code: RCode.ERROR, msg:'登录失败', data: e}
    }
  }

  async getUsersByName(username: string) {
    try {
      if(username) {
        const users = await this.userRepository.find({
          select: ['userId','username','avatar','role','tag','createTime'],
          where:{username: Like(`%${username}%`)}
        });
        return { msg:'获取用户信息成功', data: users}
      }
      return {code: RCode.FAIL, msg:'请输入用户名', data: null}
    } catch(e) {
      return {code: RCode.ERROR, msg:'查找用户错误', data: null}
    }
  }

  async setUserAvatar(user: User, file) {
    try {
      const random = Date.now() + '&'
      const writeSream = createWriteStream(join('public/avatar', random + file.originalname))
      writeSream.write(file.buffer)
      const newUser = await this.userRepository.findOne({userId: user.userId})
      newUser.avatar = `api/avatar/${random}${file.originalname}`
      await this.userRepository.save(newUser)
      return { msg: '修改头像成功', data: newUser}
    } catch (e) {
      return {code: RCode.ERROR, msg: '修改头像失败', data: e}
    }
  }
}
