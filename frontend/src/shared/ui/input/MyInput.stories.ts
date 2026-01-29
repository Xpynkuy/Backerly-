import type { Meta, StoryObj } from "@storybook/react";
import MyInput from "./MyInput";

const meta: Meta<typeof MyInput> = {
  component: MyInput,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "password"],
      description: "Тип инпута",
    },
    showPasswordToggle: {
      control: "boolean",
      description: "Показывать кнопку для отображения пароля",
    },
  },
};

export default meta;
type Story = StoryObj<typeof MyInput>;

export const Default: Story = {
  args: {
    placeholder: "Default input",
  },
};

export const PasswordWithToggle: Story = {
  args: {
    placeholder: "Password",
    type: "password",
    showPasswordToggle: true,
    value: "secret123",
  },
};
