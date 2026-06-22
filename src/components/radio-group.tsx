import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  type TextStyle,
  View,
  type ViewProps,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";

type RadioGroupContextValue = {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
  registerItem: (id: string, itemValue: string) => void;
  unregisterItem: (id: string) => void;
  selectItem: (id: string) => void;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext(component: string) {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error(`${component} must be used within RadioGroup`);
  }
  return context;
}

export type RadioGroupProps = ViewProps & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  orientation?: "horizontal" | "vertical";
};

export function RadioGroup({
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  name,
  orientation = "vertical",
  style,
  children,
  ...props
}: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolledValue;
  const itemsRef = useRef(new Map<string, string>());

  const onValueChangeRef = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const registerItem = useCallback((id: string, itemValue: string) => {
    itemsRef.current.set(id, itemValue);
  }, []);

  const unregisterItem = useCallback((id: string) => {
    itemsRef.current.delete(id);
  }, []);

  const selectItem = useCallback(
    (id: string) => {
      if (disabled) {
        return;
      }
      const itemValue = itemsRef.current.get(id);
      if (itemValue !== undefined) {
        onValueChangeRef(itemValue);
      }
    },
    [disabled, onValueChangeRef],
  );

  const contextValue = useMemo(
    () => ({
      value,
      disabled,
      name,
      onValueChange: onValueChangeRef,
      registerItem,
      unregisterItem,
      selectItem,
    }),
    [
      disabled,
      name,
      onValueChangeRef,
      registerItem,
      selectItem,
      unregisterItem,
      value,
    ],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <View
        accessibilityRole="radiogroup"
        style={[
          styles.group,
          orientation === "horizontal"
            ? styles.groupHorizontal
            : styles.groupVertical,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}

export type RadioGroupItemProps = Omit<PressableProps, "value"> & {
  value: string;
  id?: string;
};

export function RadioGroupItem({
  value,
  disabled: itemDisabled,
  id,
  style,
  ...props
}: RadioGroupItemProps) {
  const theme = useTheme();
  const generatedId = useId();
  const itemId = id ?? generatedId;
  const {
    value: groupValue,
    onValueChange,
    disabled: groupDisabled,
    registerItem,
    unregisterItem,
  } = useRadioGroupContext("RadioGroupItem");
  const disabled = itemDisabled ?? groupDisabled ?? false;
  const selected = groupValue === value;

  useEffect(() => {
    registerItem(itemId, value);
    return () => unregisterItem(itemId);
  }, [itemId, registerItem, unregisterItem, value]);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      nativeID={itemId}
      onPress={() => {
        if (!disabled) {
          onValueChange(value);
        }
      }}
      style={(state) => [
        styles.item,
        state.pressed && !disabled && styles.itemPressed,
        disabled && styles.itemDisabled,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      <View
        style={[
          styles.indicator,
          {
            borderColor: selected ? theme.text : theme.textSecondary,
            backgroundColor: theme.background,
          },
          disabled && styles.indicatorDisabled,
        ]}
      >
        {selected ? (
          <View
            style={[
              styles.indicatorDot,
              { backgroundColor: theme.text },
              disabled && styles.indicatorDotDisabled,
            ]}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

export type RadioGroupLabelProps = {
  htmlFor?: string;
  nativeID?: string;
  children: ReactNode;
  disabled?: boolean;
  style?: TextStyle;
};

export function RadioGroupLabel({
  htmlFor,
  nativeID,
  children,
  disabled = false,
  style,
}: RadioGroupLabelProps) {
  const labelNativeId = nativeID ?? htmlFor;
  const { disabled: groupDisabled, selectItem } =
    useRadioGroupContext("RadioGroupLabel");
  const isDisabled = disabled ?? groupDisabled ?? false;
  const canPress = htmlFor !== undefined && !isDisabled;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!canPress}
      onPress={() => {
        if (htmlFor) {
          selectItem(htmlFor);
        }
      }}
      style={(state) => [
        state.pressed && canPress && styles.labelPressed,
        isDisabled && styles.labelDisabled,
      ]}
    >
      <ThemedText
        nativeID={labelNativeId}
        style={[styles.label, style]}
        themeColor={isDisabled ? "textSecondary" : "text"}
      >
        {children}
      </ThemedText>
    </Pressable>
  );
}

export type RadioGroupOptionProps = {
  value: string;
  label: string;
  disabled?: boolean;
  itemStyle?: PressableProps["style"];
  labelStyle?: TextStyle;
};

export function RadioGroupOption({
  value,
  label,
  disabled,
  itemStyle,
  labelStyle,
}: RadioGroupOptionProps) {
  const id = useId();

  return (
    <View style={styles.option}>
      <RadioGroupItem
        disabled={disabled}
        id={id}
        style={itemStyle}
        value={value}
      />
      <RadioGroupLabel disabled={disabled} htmlFor={id} style={labelStyle}>
        {label}
      </RadioGroupLabel>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  groupVertical: {
    flexDirection: "column",
  },
  groupHorizontal: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  option: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  item: {
    alignItems: "center",
    borderRadius: 999,
    height: 16,
    justifyContent: "center",
    width: 16,
  },
  itemPressed: {
    opacity: 0.8,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  indicator: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 16,
    justifyContent: "center",
    width: 16,
  },
  indicatorDisabled: {
    opacity: 0.5,
  },
  indicatorDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  indicatorDotDisabled: {
    opacity: 0.5,
  },
  label: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  labelDisabled: {
    opacity: 0.5,
  },
  labelPressed: {
    opacity: 0.8,
  },
});
