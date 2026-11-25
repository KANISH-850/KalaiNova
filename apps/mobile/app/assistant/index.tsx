import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

const AGENTS = [
  { id: "finance", label: "Financial" },
  { id: "pricing", label: "Pricing" },
  { id: "catalog", label: "Cataloguing" },
  { id: "market-intelligence", label: "Market Intel" },
  { id: "business-growth", label: "Growth" },
];

export default function AIAssistantScreen() {
  const [agent, setAgent] = useState("finance");
  const [message, setMessage] = useState("Which of my products generated the highest profit this month?");
  const [reply, setReply] = useState<any>(null);

  const askAgent = async (confirmActionId?: number) => {
    const res = await api.post(`/agents/${agent}`, {
      message,
      confirm_action_id: confirmActionId,
    });
    setReply(res.data);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.deepNavy, marginBottom: 10 }}>
        Agentic AI Business Assistant
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {AGENTS.map((a) => (
          <TouchableOpacity
            key={a.id}
            onPress={() => setAgent(a.id)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: agent === a.id ? COLORS.deepNavy : "#fff",
              borderWidth: 1,
              borderColor: COLORS.border,
              marginRight: 8,
            }}
          >
            <Text style={{ color: agent === a.id ? "#fff" : COLORS.primaryText, fontWeight: "700" }}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        value={message}
        onChangeText={setMessage}
        multiline
        style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, minHeight: 80, marginBottom: 12 }}
      />

      <TouchableOpacity onPress={() => askAgent()} style={{ backgroundColor: COLORS.artisanOrange, padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>Ask {agent} Agent</Text>
      </TouchableOpacity>

      {reply && (
        <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: "800", color: COLORS.teal, marginBottom: 6 }}>Agent Response ({reply.agent_type})</Text>
          <Text style={{ lineHeight: 21, color: COLORS.primaryText }}>{reply.response}</Text>

          {reply.requires_confirmation && reply.pending_action && (
            <TouchableOpacity
              onPress={() => askAgent(reply.pending_action.action_id)}
              style={{ backgroundColor: COLORS.deepNavy, padding: 12, borderRadius: 10, alignItems: "center", marginTop: 12 }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Confirm Action: {reply.pending_action.action_name} (₹{reply.pending_action.new_price})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}
