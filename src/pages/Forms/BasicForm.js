import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
  Input,
  Card,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

const FormItem = Form.Item;

// @connect(({ loading }) => ({
//   submitting: loading.effects['form/submitRegularForm'],
// }))
@Form.create()
class BasicForms extends PureComponent {


  render() {
    const {
      tabform: { getFieldDecorator },
      index,
      form,
      dispatch
    } = this.props;
    debugger
    return (

      <Card title='我的项目选项卡是不固定数量的。所以我要在父组件获取tabs下获取所有的表单内容'>

        <FormItem label='使用父组件的form，'>
          {getFieldDecorator('title' + index)(<Input />)}
        </FormItem>
        <FormItem label='使用子组件的form，'>
          {form.getFieldDecorator('title' + index)(<Input />)}
        </FormItem>
      </Card>

    );
  }
}

export default BasicForms;
