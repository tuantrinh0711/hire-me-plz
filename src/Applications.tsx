import React, { useState } from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import type { Application } from './features/applications'
import { getApplications, saveApplications, APPLICATION_STATUSES } from './features/applications'
import { Button, Card, DatePicker, Form, Input, Modal, Select, Space, Typography } from 'antd'

const { Title, Text } = Typography
const { Option } = Select

const today = dayjs()

type ApplicationFormValues = {
  title: string
  company: string
  status: typeof APPLICATION_STATUSES[number]
  appliedDate: Dayjs
  tags: string
  cvVersion: string
  deadline: Dayjs | null
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>(() => getApplications())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm<ApplicationFormValues>()

  const openModal = () => {
    form.setFieldsValue({
      title: '',
      company: '',
      status: APPLICATION_STATUSES[0],
      appliedDate: today,
      tags: '',
      cvVersion: '',
      deadline: null,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleFinish = (values: ApplicationFormValues) => {
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      title: values.title.trim() || 'Untitled position',
      company: values.company.trim() || 'Unknown company',
      status: values.status,
      appliedDate: values.appliedDate.format('YYYY-MM-DD'),
      tags: values.tags,
      cvVersion: values.cvVersion,
      deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : '',
      result: 'pending',
      notes: '',
    }

    const nextApplications = [newApplication, ...applications]
    setApplications(nextApplications)
    saveApplications(nextApplications)
    form.resetFields()
    setIsModalOpen(false)
  }

  return (
    <div>
      <Title level={2}>Applications</Title>
      <Text type="secondary" className="block mb-6">
        Track your current application pipeline with mock data and localStorage persistence.
      </Text>

      <Button type="primary" onClick={openModal} className="mb-4">
        New application
      </Button>

      <Modal
        title="New application"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={closeModal}
        okText="Save"
      >
        <Form
          form={form}
          id="applicationForm"
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            title: '',
            company: '',
            status: APPLICATION_STATUSES[0],
            appliedDate: today,
            tags: '',
            cvVersion: '',
            deadline: null,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Form.Item name="title" label="Position" rules={[{ required: true, message: 'Enter the position' }]}> 
              <Input placeholder="Product Manager" />
            </Form.Item>

            <Form.Item name="company" label="Company" rules={[{ required: true, message: 'Enter the company' }]}> 
              <Input placeholder="Acme Corp" />
            </Form.Item>

            <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Choose a status' }]}> 
              <Select>
                {APPLICATION_STATUSES.map((status) => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Space wrap size="large" style={{ width: '100%' }}>
              <Form.Item name="appliedDate" label="Date" rules={[{ required: true, message: 'Select the application date' }]}> 
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item name="deadline" label="Deadline">
                <DatePicker className="w-full" format="YYYY-MM-DD" picker="month" />
              </Form.Item>
            </Space>

            <Form.Item name="tags" label="Tags">
              <Input placeholder="react, remote, design" />
            </Form.Item>

            <Form.Item name="cvVersion" label="CV version">
              <Input placeholder="v1, v2, portfolio" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {applications.map((application) => (
          <Card key={application.id} title={application.title} size="small" extra={<Text type="secondary">{application.status}</Text>}>
            <Text strong>{application.company}</Text>
            <div className="mt-2">
              <Text>Applied: {application.appliedDate}</Text>
            </div>
            <div>
              <Text>Tags: {application.tags || '—'}</Text>
            </div>
            <div>
              <Text>CV version: {application.cvVersion || '—'}</Text>
            </div>
            <div>
              <Text>Deadline: {application.deadline || '—'}</Text>
            </div>
            <div>
              <Text>Result: {application.result}</Text>
            </div>
          </Card>
        ))}
      </Space>
    </div>
  )
}

export default Applications
