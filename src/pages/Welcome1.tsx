import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Typography, Alert } from 'antd';
import Counter from '@/components/Counter';
import { KeepAlive } from 'umi';
import styles from './Welcome.less';

const CodePreview: React.FC<{}> = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);
function Welcome() {
  return (
    <PageContainer>
      <Card>
        <Counter />
        <Typography.Text strong>
          <a target="_blank" rel="noopener noreferrer" href="https://pro.ant.design/docs/block">
            基于 block 开发，快速构建标准页面
        </a>
        </Typography.Text>
        <CodePreview> npm run ui</CodePreview>
        <Typography.Text
          strong
          style={{
            marginBottom: 12,
          }}
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://pro.ant.design/docs/available-script#npm-run-fetchblocks"
          >
            获取全部区块
        </a>
        </Typography.Text>
        <CodePreview> npm run fetch:blocks</CodePreview>
      </Card>
      <p
        style={{
          textAlign: 'center',
          marginTop: 24,
        }}
      >
        Want to add more pages? Please refer to{' '}
        <a href="https://pro.ant.design/docs/block-cn" target="_blank" rel="noopener noreferrer">
          use block
      </a>
      。
    </p>
    </PageContainer>)
};

export default () => (
  <KeepAlive name="/Welcome" saveScrollPosition="screen">
    <Welcome />
  </KeepAlive>
)
