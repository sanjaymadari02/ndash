<template>
  <div>
    <!-- Feedback Types -->
    <el-dialog :visible.sync="dialogVisible" width="40%" style="z-index: 9999" class="feedback-dialog">
      <template v-slot:title>
        <div class="dialog-title">
          <span
            ><b
              >Hi there!<br />
              We can’t wait to get your thoughts on our application!</b
            ></span
          >
          <br />
          <p class="sub-title">What would you like to do?</p>
        </div>
      </template>
      <div>
        <div
          @click="openForm(item)"
          v-for="item in feedbackTypes"
          :key="item.id"
          class="option-list"
          :class="{ 'border-active': feedbackType === item.name }"
        >
          <el-radio class="feedback-option" v-model="feedbackType" :label="item.name" ref="feedback"></el-radio>
          <br />
          <span style="margin-left: 24px">{{ item.description }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- Feedback Form -->
    <el-dialog :visible.sync="formVisible" width="40%" style="z-index: 9999" class="feedback-dialog" :show-close="false">
      <template v-slot:title>
        <div class="dialog-title">
          <span class="title-container">
            <el-button @click="goBack" icon="el-icon-arrow-left" size="small"></el-button>
            <span class="selected-option dialog-title">{{ feedbackType }}</span>
          </span>

          <div class="form-divider"></div>
          <p class="sub-title">We are listening! Please provide as much information as possible so that we can help you.</p>
        </div>
      </template>
      <template>
        <el-form>
          <el-form-item label="Feedback" required :error="messageError">
            <el-input
              v-model="feedbackItem.message"
              type="textarea"
              placeholder="Enter your feedback."
              :autosize="{ minRows: 4, maxRows: 4 }"
              style="width: 100%"
            ></el-input>
          </el-form-item>
          <el-form-item label="Email" required :error="emailError">
            <el-input v-model="feedbackItem.email" placeholder="Enter your email." style="width: 100%"></el-input>
          </el-form-item>

          <el-form-item v-if="shouldShowAttachments" label="Attachments"
            ><br />
            <!-- //TODO: File Upload funtionality. -->
          </el-form-item>

          <br />
          <span style="display: flex">
            <el-button @click="goBack()">Cancel</el-button>
            <el-button @click="submitFeedback" type="primary" style="width: 100%">Submit</el-button>
          </span>
        </el-form>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ElUploadInternalFileDetail } from 'element-ui/types/upload'
import Vue from 'vue'
import { FeedbackItem } from '../store/ndash'

export default Vue.extend({
  name: 'FeedbackDialog',
  data() {
    return {
      file: null as ElUploadInternalFileDetail[] | null,
      feedbackItem: {
        email: null as string | null,
        message: null as string | null,
        auth_token: null as string | null,
        sdk_version: null as string | null,
        app_version: null as string | null,
        user_agent: null as string | null,
        device_id: null as string | null,
        feedback_url: null as string | null,
        media_url: null as string | null,
        type: null as number | null,
      } as FeedbackItem,
      emailError: null as string | null,
      messageError: null as string | null,
      loading: false,
      dialogVisible: false,
      formVisible: false,
      feedbackType: null,
      canShowAttachment: false,
      feedbackTypes: [
        {
          id: 1,
          name: 'Report a Bug',
          description: 'Let us know so we can forward this to our bug control.',
        },
        {
          id: 2,
          name: 'Request a Feature',
          description: 'Do you have an idea that could make our app better? We would love to know!',
        },
        {
          id: 3,
          name: 'Send Applause',
          description: 'Let us know what you really like about our app!',
        },
      ],
    }
  },

  computed: {
    shouldShowAttachments(): boolean {
      return this.feedbackType != 'Send Applause'
    },
  },

  methods: {
    openDialog(feedback: FeedbackItem) {
      this.dialogVisible = true
      this.feedbackType = null
      this.feedbackItem = feedback
    },

    resetForm() {
      this.emailError = null
      this.messageError = null
      this.feedbackItem.message = ''
    },

    openForm(feedbackType: any) {
      this.resetForm()
      this.feedbackType = feedbackType.name
      this.dialogVisible = false
      this.formVisible = true
    },

    goBack() {
      this.$confirm('This will clears all filled data. Continue?', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
      })
        .then(() => {
          this.dialogVisible = true
          this.formVisible = false
          this.feedbackItem.message = ''
        })
        .catch(() => {
          return
        })
    },

    async submitFeedback(): Promise<void> {
      this.emailError = ''
      this.messageError = ''

      if (this.feedbackItem?.message == null && this.feedbackItem?.email == null) {
        this.messageError = 'Please enter your feedback.'
        this.emailError = 'Please enter your email.'
        return
      }

      if (this.feedbackItem?.message == null) {
        this.messageError = 'Please enter your feedback.'
        return
      }

      if (this.feedbackItem?.email == null) {
        this.emailError = 'Please enter your email.'
        return
      }

      try {
        this.feedbackItem.type = this.feedbackTypes.find((x) => x.name == this.feedbackType)!.id
        this.loading = true
        //TODO: Upload images first.
        const fileData = new FormData()
        await this.$store.dispatch('submitFeedback', this.feedbackItem)
        this.$message({
          message: 'Feedback submitted.',
          type: 'success',
        })

        this.dialogVisible = false
        this.formVisible = false
        this.feedbackItem = {} as FeedbackItem
      } catch (error: any) {
        this.$message({
          message: 'Error in creating feedback.',
          type: 'error',
        })
      } finally {
        this.loading = false
      }
    },
  },
})
</script>

<style lang="scss">
.dialog-title {
  font-weight: 700;
  font-size: 16px;
  color: #171724;
  line-height: 22px;
  letter-spacing: -0.01px;
}

.sub-title {
  color: #9d9da6;
  line-height: 22px;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: -0.02px;
  margin-bottom: 10px;
  margin-top: 6px;
  .feedback-option {
    color: #171724;
    font-weight: 500;
  }
}

.option-list {
  padding: 9px 16px;
  border-radius: 4px;
  letter-spacing: -0.01px;
  border: 1px solid var(--border-color, #dcdfe6);
  background: var(--fill-color-blank, #fff);
  &:not(:first-child) {
    margin-top: 16px;
  }
}

.border-active {
  border: 1px solid #409eff;
  color: #409eff;
}

.feedback-dialog {
  .el-dialog__body {
    border-top: 1px solid #dcdfe6;
    padding: 20px 20px;
  }
}

.form-divider {
  border-top: 1px solid #dcdfe6;
  margin-bottom: 12px;
  margin-top: 12px;
}

.title-container {
  display: flex;
  align-items: center;
}

.title-container .selected-option {
  margin-left: 160px;
  flex: 1;
}

.el-form-item__label {
  color: #171724;
}
</style>
