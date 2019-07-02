import React, { PureComponent, Fragment } from 'react';
import {
  Table,
  Button,
  Input,
  message,
  Popconfirm,
  Divider,
  Icon,
  Form,
  Menu,
  Dropdown,
  Modal,
} from 'antd';
import isEqual from 'lodash/isEqual';
import styles from './OrderDetails.less';
const Label = React.forwardRef(({ value }, ref) => <span ref={ref}>{value}</span>);
@Form.create()
class TableForm extends PureComponent {
  cacheOriginData = {};

  constructor(props) {
    super(props);

    this.state = {
      data: props.value,
      loading: false,
      /* eslint-disable-next-line react/no-unused-state */
      value: props.value,
      tijil: 0,
      xiangshul: 0,
      maozhongl: 0,
      jfzl: 0,
      zfyl: 0
    };
  }
  // 从props中获取state  传入的props映射到state上面 生命周期
  static getDerivedStateFromProps(nextProps, preState) {
    if (isEqual(nextProps.value, preState.value)) {
      return null;
    }
    return {
      data: nextProps.value,
      value: nextProps.value,
    };
  }
  // 根据key获取row
  getRowByKey(key, newData) {
    const { data } = this.state;
    return (newData || data).filter(item => item.key === key)[0];
  }
  // 复制当前行到下一行
  copyCurrentRowToNextRow = (e, key, idx) => {
    // e.preventDefault();
    this.newMember(idx, key);
  };
  // 编辑  双击保存有问题
  toggleEditable = (e, key, index) => {
    e.preventDefault();
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);

    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
        this.setState({
          data: newData,
        });
        target.editable = !target.editable;
      } else {
        setTimeout(this.saveRow(e, key, index), 10);
        //this.saveRow(e, key);
      }
    }
  };
  // 新增
  newMember = (idx, key) => {
    const { data } = this.state;
    const { form } = this.props;
    const newData = data.map(item => ({ ...item }));
    this.setState({ data: newData });
    form.validateFields((error, values) => {
      if (error) {
        message.error('请填写完整信息,在进行复制!');
        // e.target.focus();
        return;
        // this.setState({
        //   loading: false,
        // });
      } else {
        let t = [], i = [];
        var rowt, rowi;
        data.forEach(row => {
          t.push(parseInt(row.key));
          i.push(parseInt(row.BoxInfoId));
        });
        if (t.length === 0)
          rowt = 0;
        else
          rowt = Math.max.apply(null, t);
        if (i.length === 0)
          rowi = 0;
        else
          rowi = Math.max.apply(null, t);
        if (idx != 'idx') {
          const target = this.getRowByKey(key, newData);
          newData.splice(idx + 1, 0, {
            key: `${parseInt(rowt) + 1}`,
            BoxInfoId: key,
            HSCode: 'target.workId',
            name: 'target.name',
            editable: true,
            isNew: true,
            isDis: true,
          });

        } else {
          console.log(data);
          newData.push({
            key: `${parseInt(rowt) + 1}`,
            BoxInfoId: `${parseInt(rowi) + 1}`,
            workId: '',
            name: '',
            department: '',
            editable: true,
            isNew: true,
          });
        }
      }
    });
  };
  // 删除
  remove(key) {
    const { data } = this.state;
    const { onChange } = this.props;
    const newData = data.filter(item => item.key !== key);
    this.setState({ data: newData });
    onChange(newData);
  }
  // 回车当前编辑行保存
  handleKeyPress(e, key, index) {
    // this.saveRow(e, key);
    setTimeout(this.saveRow(e, key, index), 10);
  }
  // 单元格文本框修改
  handleFieldChange(e, fieldName, key) {
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target.value;
      this.setState({ data: newData });
    }
  }

  // 保存
  saveRow(e, key, index) {
    e.persist();
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const { dispatch, form, onChange } = this.props;
      const { data } = this.state;
      const newData = data.map(item => ({ ...item }));
      const target = this.getRowByKey(key, newData) || {};
      debugger
      form.validateFields((error, values) => {
        if (error) {
          message.error('请填写完整信息。');
          e.target.focus();
          this.setState({
            loading: false,
          });
          return;
        }
        delete target.isNew;
        // this.toggleEditable(e, key);
        // 取消编辑模式
        target.editable = false;
        target.tiji = target.BoxLong * target.BoxWide * target.BoxHigh;
        this.setState({ data: newData });
        console.log(newData);
        let tiji = 0, xiangshu = 0, maozhong = 0, jfz = 0, zfy = 0;
        newData.forEach(row => {
          tiji += parseInt(row.tiji || 0);
          xiangshu += parseInt(row.BoxNum || 0);
          maozhong += parseFloat(row.BoxWeight || 0);
        });
        jfz = parseFloat(tiji / 1000000 * 167) > parseFloat(maozhong) ? parseInt(tiji / 1000000 * 167) : parseFloat(maozhong);

        const { trainPriceByNation, dispatch } = this.props;
        console.log('trainPriceByNation', trainPriceByNation)
        if (trainPriceByNation.TrainPrice) {
          zfy = parseFloat(jfz) * parseInt(trainPriceByNation.TrainPrice)
        } else {
          if (maozhong <= 100) {
            zfy = parseFloat(jfz) * parseInt(trainPriceByNation.A100)
          }
          if (maozhong <= 500 && maozhong > 100) {
            zfy = parseFloat(jfz) * parseInt(trainPriceByNation.A500)
          }
          if (maozhong <= 1000 && maozhong > 500) {
            zfy = parseFloat(jfz) * parseInt(trainPriceByNation.A1000)
          }
          if (maozhong <= 3000 && maozhong > 1000) {
            zfy = parseFloat(jfz) * parseInt(trainPriceByNation.A3000)
          }
        }
        this.setState({
          loading: false,
          tijil: tiji || 0,
          xiangshul: xiangshu || 0,
          maozhongl: parseFloat(maozhong).toFixed(1) || 0,
          jfzl: parseFloat(jfz).toFixed(1) || 0,
          zfyl: parseFloat(zfy).toFixed(1) || 0,
        });
      });
      onChange(newData);


      // if (!target.workId || !target.name || !target.department) {
      //   message.error('请填写完整成员信息。');
      //   e.target.focus();
      //   this.setState({
      //     loading: false,
      //   });
      //   return;
      // }
    }, 500);
  }
  footer = () => {
    const { tijil, xiangshul, maozhongl, jfzl, zfyl } = this.state;
    return `箱数：${xiangshul}  毛重：${maozhongl} 体积：${tijil
      } 计费重：${jfzl} 总费用：${zfyl} `;
  }
  // 取消
  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault(); // 通知 Web 浏览器不要执行与事件关联的默认动作
    const { data } = this.state;
    const newData = data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      delete this.cacheOriginData[key];
    }
    target.editable = false;
    this.setState({ data: newData });
    this.clickedCancel = false;
  }
  handleMenuClick = (e, key, index) => {
    const { dispatch } = this.props;

    switch (e.key) {
      case 'remove':
        Modal.confirm({
          title: '删除任务',
          content: '确定删除该任务吗？',
          okText: '确认',
          cancelText: '取消',
          onOk: () => this.remove(key),
        });
        break;
      default:
        break;
    }
  };
  render() {
    const { form } = this.props;

    const columns = [
      {
        title: '#',
        dataIndex: 'BoxInfoId',
        key: 'BoxInfoId',
        render: (text, record, index) => {
          return <Form.Item style={{ margin: 0 }} >
            {form.getFieldDecorator('BoxInfoId' + index, {
              rules: [
                {
                  required: true,
                  message: `#不能为空.`,
                },
              ],
              initialValue: record['BoxInfoId'],
            })(
              <Label />
            )}
          </Form.Item>
        },
      },
      {
        title: '发货编号',
        dataIndex: 'ShipCode',
        key: 'ShipCode',
        width: 120,
        editable: true,
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }} >
              {form.getFieldDecorator('ShipCode' + index, {
                rules: [
                  {
                    required: true,
                    message: `发货编号不能为空.`,
                  },
                ],
                initialValue: record['ShipCode'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'ShipCode', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },
      {
        title: '箱数*',
        dataIndex: 'BoxNum',
        key: 'BoxNum',
        editable: true,
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('BoxNum' + index, {
                rules: [
                  {
                    required: true,
                    message: `箱数不能为空.`,
                  },
                ],
                initialValue: record['BoxNum'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'BoxNum', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },
      {
        title: '中文品名*',
        dataIndex: 'CnName',
        key: 'CnName',
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('CnName' + index, {
                rules: [
                  {
                    required: true,
                    message: `单箱重量不能为空.`,
                  },
                ],
                initialValue: record['CnName'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'CnName', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },
      {
        title: '英文品名*',
        dataIndex: 'EnName',
        key: 'EnName',
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('EnName' + index, {
                rules: [
                  {
                    required: true,
                    message: `单箱重量不能为空.`,
                  },
                ],
                initialValue: record['EnName'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'EnName', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },
      {
        title: '产品HS CODE*',
        dataIndex: 'HSCode',
        key: 'HSCode',
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('HSCode' + index, {
                rules: [
                  {
                    required: true,
                    message: `单箱重量不能为空.`,
                  },
                ],
                initialValue: record['HSCode'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'HSCode', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },
      {
        title: '单价*',
        dataIndex: 'UnitPrice',
        key: 'UnitPrice',
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('UnitPrice' + index, {
                rules: [
                  {
                    required: true,
                    message: `单箱重量不能为空.`,
                  },
                ],
                initialValue: record['UnitPrice'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'UnitPrice', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },

      {
        title: '材质*',
        dataIndex: 'Material',
        key: 'Material',
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('Material' + index, {
                rules: [
                  {
                    required: true,
                    message: `单箱重量不能为空.`,
                  },
                ],
                initialValue: record['Material'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'Material', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },

      {
        title: '用途*',
        dataIndex: 'Purpose',
        key: 'Purpose',
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('Purpose' + index, {
                rules: [
                  {
                    required: true,
                    message: `单箱重量不能为空.`,
                  },
                ],
                initialValue: record['Purpose'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'Purpose', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },

      {
        title: '品牌*',
        dataIndex: 'Brand',
        key: 'Brand',
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('Brand' + index, {
                rules: [
                  {
                    required: true,
                    message: `单箱重量不能为空.`,
                  },
                ],
                initialValue: record['Brand'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'Brand', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },

      {
        title: '型号*',
        dataIndex: 'Model',
        key: 'Model',
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('Model' + index, {
                rules: [
                  {
                    required: true,
                    message: `单箱重量不能为空.`,
                  },
                ],
                initialValue: record['Model'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'Model', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },

      {
        title: '单箱重量(KG)*',
        dataIndex: 'BoxWeight',
        key: 'BoxWeight',
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('BoxWeight' + index, {
                rules: [
                  {
                    required: true,
                    message: `单箱重量不能为空.`,
                  },
                ],
                initialValue: record['BoxWeight'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'BoxWeight', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },
      {
        title: '货箱长度(CM)*',
        dataIndex: 'BoxLong',
        key: 'BoxLong',
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('BoxLong' + index, {
                rules: [
                  {
                    required: true,
                    message: `货箱长度不能为空.`,
                  },
                ],
                initialValue: record['BoxLong'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'BoxLong', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },
      {
        title: '货箱宽度(CM)*',
        dataIndex: 'BoxWide',
        key: 'BoxWide',
        render: (text, record, index) => {
          if (record.editable) {
            return <Form.Item style={{ margin: 0 }}>
              {form.getFieldDecorator('BoxWide' + index, {
                rules: [
                  {
                    required: true,
                    message: `货箱宽度不能为空.`,
                  },
                ],
                initialValue: record['BoxWide'],
              })(
                <Input
                  disabled={record.isDis}
                  autoFocus
                  onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                  onChange={e => this.handleFieldChange(e, 'BoxWide', record.key)}
                />
              )}
            </Form.Item>
          } else {
            return text
          }
        },
      },
      {
        title: '货箱高度(CM)*',
        dataIndex: 'BoxHigh',
        key: 'BoxHigh',
        render: (text, record, index) => {
          if (record.editable) {
            return <Fragment>
              <Form.Item style={{ margin: 0 }}>
                {form.getFieldDecorator('BoxHigh' + index, {
                  rules: [
                    {
                      required: true,
                      message: `货箱高度不能为空.`,
                    },
                  ],
                  initialValue: record['BoxHigh'],
                })(
                  <Input
                    disabled={record.isDis}
                    autoFocus
                    onPressEnter={e => this.handleKeyPress(e, record.key, index)}
                    onChange={e => this.handleFieldChange(e, 'BoxHigh', record.key)}
                  />
                )}
              </Form.Item>

            </Fragment>
          } else {
            return text
          }
        },
      },
      {
        title: '体积',
        dataIndex: 'tiji',
        key: 'tiji',
        width: 60,
        render: (text, record, index) => {

          return parseFloat(record.BoxLong * record.BoxWide * record.BoxHigh || 0).toFixed(1);
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        // fixed: 'right',
        render: (text, record, index) => {

          const { loading } = this.state;
          if (!!record.editable && loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                // 新增
                <span>
                  <a onClick={e => this.saveRow(e, record.key, index)}>保存</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              // 修改
              <span>
                <a onClick={e => this.saveRow(e, record.key, index)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, record.key)}>取消</a>
              </span>
            );
          }
          return (
            // 保存
            <span>
              <Dropdown
                overlay={
                  <Menu onClick={e => this.handleMenuClick(e, record.key, index)} selectedKeys={[]}>
                    <Menu.Item
                      key="xinzen"
                      onClick={e => this.copyCurrentRowToNextRow(e, record.BoxInfoId, index)}>
                      新增同一品名装箱
                      </Menu.Item>
                    <Menu.Item
                      key="xinzengbutong"
                      onClick={() => this.newMember('idx', 'key')}
                    >新增不同品名装箱
                    </Menu.Item>
                    {/* <Popconfirm title="是否要删除此行？"> */}
                    <Menu.Item key="remove">
                      删除
                      </Menu.Item>
                    {/* </Popconfirm> */}
                    <Menu.Item
                      key="copy"
                    // onClick={e => this.copyCurrentRowToNextRow(e, record.key, index)}
                    >
                      复制
                    </Menu.Item>
                    <Menu.Item key="paste">黏贴</Menu.Item>
                  </Menu>
                }
              >
                <a>
                  查看 <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          );
        },
      },
    ];

    const { loading, data } = this.state;
    return (
      <Fragment>
        <Table
          // scroll={{ x: 1300 }}
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          footer={this.footer}
          className={styles.tableInput}
          rowClassName={record => (record.editable ? styles.editable : '')}
          onRow={(record, index) => {
            return {
              onDoubleClick: e => this.toggleEditable(e, record.key, index),
            };
          }}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={() => this.newMember('idx', 'key')}
          icon="plus"
        >
          新增成员
        </Button>
      </Fragment>
    );
  }
}

export default TableForm;
