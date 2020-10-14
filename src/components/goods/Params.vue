<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只能为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="cateSelectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisable"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="deleteParamsTag(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="id"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only"
          ><el-button
            type="primary"
            size="mini"
            :disabled="isDisable"
            @click="addDialogVisible = true"
            >添加属性</el-button
          ><!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="deleteParamsTag(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="id"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数/属性对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加的表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRule"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数/属性对话框 -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加的表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRule"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      cateList: [],

      // 级联选择器配置参数
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器选中的id数组
      cateSelectedKeys: [],

      // 标签页当前显示标签
      activeName: 'many',

      // 动态参数数据列表
      manyTableData: [],
      // 静态参数数据列表
      onlyTableData: [],

      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,

      // 添加参数/属性表单数据
      addForm: {
        attr_name: ''
      },

      // 表单验证规则
      addFormRule: {
        attr_name: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      },

      // 控制编辑对话框显示与隐藏
      editDialogVisible: false,
      // 编辑表单数据对象
      editForm: {
        attr_name: '',
        attrId: ''
      },
      // 编辑表单验证规则
      editFormRule: {
        attr_name: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data
    },

    // 级联选择器发送变化触发的事件
    handleChange() {
      // 如果选中的数组长度不等于3则清空选中数组直接返回
      if (this.cateSelectedKeys.length !== 3) {
        this.cateSelectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return false
      }
      this.getParamsData()
    },

    handleTabClick() {
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData() {
      // 根据选中分类id与标签名称获取参数列表
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      // 将attr_vals标签遍历成一个逗号分隔的数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // tag标签输入文本框显示与隐藏
        item.inputVisible = false
        // 输入文本框内容
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },

    // 监听添加对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    // 添加参数/属性
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败！')
        }
        this.$message.success('添加成功！')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },

    // 监听编辑表单关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮展示编辑对话框
    showEditDialog(row) {
      this.editDialogVisible = true
      this.editForm.attrId = row.attr_id
      this.editForm.attr_name = row.attr_name
    },
    // 点击按钮确认编辑参数/属性
    editParams() {
      // 表单初校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return false
        }
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attrId}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑失败！')
        }
        this.$message.success('编辑成功！')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },

    // 删除参数/属性
    async deleteParams(attrId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该内容, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${attrId}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败！')
        }
        this.$message.success('删除成功！')
        this.getParamsData()
      } else {
        return this.$message.info('取消了删除操作！')
      }
    },

    // 标签输入文本框触发事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return false
      }
      // 如果没有return，则表示内容合法,添加该内容
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 发起请求，保存这次操作
      this.saveParamsTag(row)
    },

    // 保存参数/属性标签至数据库
    async saveParamsTag(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('修改失败！')
      }
      this.$message.success('修改成功！')
    },

    // 标签添加按钮触发事件
    showInput(row) {
      row.inputVisible = true
      // 点击使文本输入框自动获取焦点
      // $nextTick的作用是当页面重新渲染后再调用回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 删除参数/属性标签触发事件
    deleteParamsTag(i, row) {
      // 从数组中删除索引为i的1项
      row.attr_vals.splice(i, 1)
      this.saveParamsTag(row)
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    isDisable() {
      if (this.cateSelectedKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 获取当前级联选择器选中的id
    cateId() {
      if (this.cateSelectedKeys.length === 3) {
        return this.cateSelectedKeys[2]
      }
      return null
    },

    // 动态计算对话框title名称
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style scoped>
.cat_opt {
  margin-top: 15px;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
