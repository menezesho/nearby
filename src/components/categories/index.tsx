import { FlatList } from "react-native"

import { s } from "./styles"
import { Category } from "./components/category"

export type CategoryProps = {
  id: string
  name: string
}

type Props = {
  data: CategoryProps[]
  selected: CategoryProps | null
  onSelect: (category: CategoryProps) => void
}

export function Categories({ data, selected, onSelect }: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Category
          name={item.name}
          iconId={item.id}
          onPress={() => onSelect(item)}
          isSelected={item.id === selected?.id}
        />
      )}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.content}
      style={s.container}
    />
  )
}
