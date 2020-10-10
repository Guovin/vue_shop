<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="AddDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList">
        <!-- 扩展列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 == '0' ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-arrow-right"></i>
              </el-col>
              <!-- 渲染二、三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环渲染二级权限 -->
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 == '0' ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-arrow-right"></i>
                  </el-col>
                  <!-- 通过for循环渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="id"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框区域 -->
    <el-dialog
      title="添加角色"
      :visible.sync="AddDialogVisible"
      width="40%"
      @close="addFormClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormrules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="AddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框区域 -->
    <el-dialog
      title="分配权限"
      :visible.sync="SetRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 内容主体区域 -->
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 添加角色数据表单
      rolesList: [],
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 控制对话框显示
      AddDialogVisible: false,
      // 添加用户表单规则
      addFormrules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色名称的长度在2~10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 2,
            max: 15,
            message: '角色描述的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ]
      },

      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 修改用户的表单数据对象
      editForm: {},
      // 修改用户表单的验证规则对象
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色名称的长度在2~10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 2,
            max: 15,
            message: '角色描述的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ]
      },

      // 控制分配权限对话框显示
      SetRightDialogVisible: false,
      // 所有树形权限数据
      rightsList: [],
      // 树形控件绑定的对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 树形控件默认选中的节点id数组
      defaultKeys: [],

      // 即将分配权限的角色id
      roleId: ''
    }
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        // 验证通过，可以发起添加角色的网络请求
        const { data: res } = await this.$http.post('roles', this.addForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }

        this.$message.success('添加角色成功！')
        // 隐藏添加角色的对话框
        this.AddDialogVisible = false
        // 重新获取角色列表数据
        this.getRolesList()
      })
    },
    // 监听添加角色的对话框关闭事件
    addFormClosed() {
      this.$refs.addFormRef.resetFields()
    },

    // 展示编辑角色的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败！')
      }

      this.editForm = res.data
      this.editDialogVisible = true
    },

    // 监听修改角色的对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    // 修改角色信息并提交
    editRoleInfo() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return false
        // 验证通过可以发起修改角色信息数据请求
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败！')
        }

        // 关闭对话框
        this.editDialogVisible = false
        // 获取最新角色信息
        this.getRolesList()
        // 提示更新成功
        this.$message.success('更新角色信息成功！')
      })
    },

    // 根据角色id删除角色
    async deleRoleById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // console.log(confirmResult)
      // 点击确认返回的是confirm字符串
      // 点击取消返回的是cancel字符串

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作')
      }

      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功！')
      this.getRolesList()
    },

    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作！')
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')
      role.children = res.data
    },

    // 展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id

      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      this.rightsList = res.data
      // 递归获取三级权限节点的id
      this.getLeafKeys(role, this.defaultKeys)
      this.SetRightDialogVisible = true
    },

    // 通过递归，获取该角色下所有三级权限的id并保存到defaultKeys中
    getLeafKeys(node, arr) {
      // 如果node节点不包含children属性，则是三级权限节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },

    // 监听权限分配对话框关闭事件
    setRightDialogClosed() {
      this.defaultKeys = []
    },

    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const strKeys = keys.join(',')

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: strKeys }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }

      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.SetRightDialogVisible = false
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
