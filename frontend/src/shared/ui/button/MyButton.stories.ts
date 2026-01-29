import type { Meta, StoryObj } from "@storybook/react";
import MyButton from "./MyButton";

const meta: Meta<typeof MyButton> = {
  component: MyButton,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof MyButton>;

export const Primary: Story = {
  args: {
    children: "Button",
  },
};
