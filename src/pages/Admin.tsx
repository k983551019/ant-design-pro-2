import React from 'react';
import { HeartTwoTone, SmileTwoTone } from '@ant-design/icons';
import { Card, Typography, notification } from 'antd';
// import { KeepAlive, useActivate, useUnactivate, AliveScope } from 'umi';
import Counter from '@/components/Counter';
import { KeepAlive, useActivate, useUnactivate, AliveScope } from 'react-activation';

function Chart() {

  useActivate(() => {
    notification.success({
      message: '[Chart] activated'
    })
  })
  useUnactivate(() => {
    notification.warning({
      message: '[Chart] unactivated'
    })
  })
  return (<div>
    <Card>
      <Counter />
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        <SmileTwoTone /> Ant Design Pro <HeartTwoTone twoToneColor="#eb2f96" /> You
      </Typography.Title>
    </Card>
    <p style={{ textAlign: 'center', marginTop: 24 }}>
      Want to add more pages? Please refer to{' '}
      <a href="https://pro.ant.design/docs/block-cn" target="_blank" rel="noopener noreferrer">
        use block
      </a>
      。
    </p>
  </div>)
};


export default () => (
  // <KeepAlive name="/admin/sub-page" saveScrollPosition="screen">
  <Chart />
)
