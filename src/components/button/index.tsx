import React from 'react'
import { Text, TouchableOpacity, TextProps, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { IconProps as TablerIconProps } from '@tabler/icons-react-native';
import { colors } from '@/styles/colors';
import { s } from './styles';

type ButtonProps = TouchableOpacityProps & {
  isLoading?: boolean
}

type IconProps = {
  icon: React.ComponentType<TablerIconProps>
}

function Button({ children, style, isLoading = false, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isLoading}
      style={[s.container, style]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.gray[100]}
        />
      ) : children}
    </TouchableOpacity>
  )
}

function Title({ children, ...rest }: TextProps) {
  return (
    <Text
      style={s.title}
      {...rest}
    >
      {children}
    </Text>
  )
}

function Icon({ icon: Icon }: IconProps) {
  return (
    <Icon
      size={24}
      color={colors.gray[100]}
    />
  )
}

Button.Title = Title
Button.Icon = Icon

export { Button }