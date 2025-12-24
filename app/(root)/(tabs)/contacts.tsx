import { Plus, Search, UserPlus, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock contacts data
const contactsData = [
  {
    id: "1",
    name: "Alice Johnson",
    status: "Hey there! I'm using WhatsApp.",
    avatar: "https://i.pravatar.cc/150?img=1",
    online: true,
  },
  {
    id: "2",
    name: "Bob Smith",
    status: "Busy",
    avatar: "https://i.pravatar.cc/150?img=2",
    online: false,
  },
  {
    id: "3",
    name: "Carol Williams",
    status: "Available",
    avatar: "https://i.pravatar.cc/150?img=3",
    online: true,
  },
  {
    id: "4",
    name: "David Brown",
    status: "At work",
    avatar: "https://i.pravatar.cc/150?img=4",
    online: false,
  },
  {
    id: "5",
    name: "Emma Davis",
    status: "Can't talk, WhatsApp only",
    avatar: "https://i.pravatar.cc/150?img=5",
    online: true,
  },
  {
    id: "6",
    name: "Frank Miller",
    status: "Sleeping",
    avatar: "https://i.pravatar.cc/150?img=6",
    online: false,
  },
  {
    id: "7",
    name: "Grace Wilson",
    status: "Hey there! I'm using WhatsApp.",
    avatar: "https://i.pravatar.cc/150?img=7",
    online: true,
  },
  {
    id: "8",
    name: "Henry Moore",
    status: "Available",
    avatar: "https://i.pravatar.cc/150?img=8",
    online: false,
  },
];

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme();

  const colors = {
    light: {
      background: "#FFFFFF",
      card: "#F8F9FA",
      text: "#000000",
      subtext: "#6B7280",
      border: "#E5E5EA",
      primary: "#0084FF",
      searchBg: "#F0F2F5",
    },
    dark: {
      background: "#000000",
      card: "#1C1C1E",
      text: "#FFFFFF",
      subtext: "#8E8E93",
      border: "#38383A",
      primary: "#0A84FF",
      searchBg: "#2C2C2E",
    },
  };

  const theme = colorScheme === "dark" ? colors.dark : colors.light;

  const filteredContacts = contactsData.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group contacts alphabetically
  const groupedContacts = filteredContacts.reduce(
    (groups, contact) => {
      const firstLetter = contact.name[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(contact);
      return groups;
    },
    {} as Record<string, typeof contactsData>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: theme.background,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: theme.text,
            }}
          >
            Contacts
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.primary,
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserPlus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.searchBg,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Search size={20} color={theme.subtext} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 16,
              color: theme.text,
              paddingVertical: 4,
            }}
            placeholder="Search contacts..."
            placeholderTextColor={theme.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.card,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            gap: 8,
          }}
        >
          <Users size={20} color={theme.primary} />
          <Text style={{ color: theme.text, fontWeight: "600" }}>
            New Group
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.card,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            gap: 8,
          }}
        >
          <Plus size={20} color={theme.primary} />
          <Text style={{ color: theme.text, fontWeight: "600" }}>
            New Contact
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contacts List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(groupedContacts)
          .sort()
          .map((letter) => (
            <View key={letter}>
              {/* Section Header */}
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: theme.background,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: theme.primary,
                  }}
                >
                  {letter}
                </Text>
              </View>

              {/* Contacts in Section */}
              {groupedContacts[letter].map((contact, index) => (
                <TouchableOpacity
                  key={contact.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: theme.background,
                    borderBottomWidth:
                      index === groupedContacts[letter].length - 1 ? 0 : 0.5,
                    borderBottomColor: theme.border,
                  }}
                  activeOpacity={0.7}
                >
                  {/* Avatar */}
                  <View style={{ position: "relative" }}>
                    <Image
                      source={{ uri: contact.avatar }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                      }}
                    />
                    {contact.online && (
                      <View
                        style={{
                          position: "absolute",
                          bottom: 2,
                          right: 2,
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: "#10B981",
                          borderWidth: 2,
                          borderColor: theme.background,
                        }}
                      />
                    )}
                  </View>

                  {/* Contact Info */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: theme.text,
                        marginBottom: 4,
                      }}
                    >
                      {contact.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.subtext,
                      }}
                      numberOfLines={1}
                    >
                      {contact.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
      </ScrollView>

      {/* Contact Count */}
      <View
        style={{
          position: "absolute",
          bottom: 100,
          alignSelf: "center",
          backgroundColor: theme.card,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text style={{ color: theme.subtext, fontSize: 12, fontWeight: "600" }}>
          {filteredContacts.length} contacts
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Contacts;
