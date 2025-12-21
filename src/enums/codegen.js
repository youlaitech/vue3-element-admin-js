export const FormTypeEnum = {
  INPUT: { value: 1, label: "输入框" },
  SELECT: { value: 2, label: "下拉框" },
  RADIO: { value: 3, label: "单选框" },
  CHECK_BOX: { value: 4, label: "复选框" },
  INPUT_NUMBER: { value: 5, label: "数字输入框" },
  SWITCH: { value: 6, label: "开关" },
  TEXT_AREA: { value: 7, label: "文本域" },
  DATE: { value: 8, label: "日期框" },
  DATE_TIME: { value: 9, label: "日期时间框" },
  HIDDEN: { value: 10, label: "隐藏域" },
};

export const QueryTypeEnum = {
  EQ: { value: 1, label: "=" },
  LIKE: { value: 2, label: "LIKE '%s%'" },
  IN: { value: 3, label: "IN" },
  BETWEEN: { value: 4, label: "BETWEEN" },
  GT: { value: 5, label: ">" },
  GE: { value: 6, label: ">=" },
  LT: { value: 7, label: "<" },
  LE: { value: 8, label: "<=" },
  NE: { value: 9, label: "!=" },
  LIKE_LEFT: { value: 10, label: "LIKE '%s'" },
  LIKE_RIGHT: { value: 11, label: "LIKE 's%'" },
};
