import { View, Text, TouchableOpacity } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'


export const Header = () => {
  return (
    <View className="inline-flex p-3 rounded-e-md flex-row items-center justify-between bg-[#2D55FF] border-b border-gray-100">
      <View className="flex-col">
        <Text className="text-3xl font-black tracking-tight">
          <Text className="text-white text-600">Social</Text>
          <Text className="text-gray-200">Feed</Text>
        </Text>
      <Text className="text-xs text-gray-300 font-semibold mt-1">
        Stay Connected
      </Text>
    </View>
    <View className="flex-row gap-3">
      <TouchableOpacity className="w-11 h-11 rounded-full bg-blue-50 justify-center items-center">
        <Text className="text-lg">🔔</Text>
      </TouchableOpacity>
      <TouchableOpacity className="w-11 h-11 rounded-full bg-blue-50 justify-center items-center">
        <Text className="text-lg">✉️</Text>
      </TouchableOpacity>
    </View>
  </View>

  )
}
