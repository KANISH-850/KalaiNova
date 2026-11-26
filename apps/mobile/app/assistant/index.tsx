import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MessageSquare } from "lucide-react-native";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/Header";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

const HELPERS = [
  { id: "finance", label: "Money & Profit" },
  { id: "pricing", label: "Fair Price" },
  { id: "catalog", label: "Listing Help" },
  { id: "market-intelligence", label: "Buyers" },
  { id: "business-growth", label: "Grow Sales" },
];

export default function AIAssistantScreen() {
  const { language } = useAuthStore();
  const [agent, setAgent] = useState("finance");
  const [message, setMessage] = useState("Which of my products generated the highest profit this month?");
  const [reply, setReply] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const askAgent = async (confirmActionId?: number) => {
    setLoading(true);
    try {
      const res = await api.post(`/agents/${agent}`, {
        message,
        confirm_action_id: confirmActionId,
      });
      setReply(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 100 }}>
        <Header
          title="Shop Helper"
          subtitle="Ask a plain question about your earnings, prices, or buyers."
          speakText={reply?.response}
          language={language}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.sm }}>
          {HELPERS.map((a) => {
            const active = agent === a.id;
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => setAgent(a.id)}
                style={{
                  minHeight: 48,
                  paddingHorizontal: 14,
                  borderRadius: RADIUS.control,
                  backgroundColor: active ? PALETTE.primary : PALETTE.surface,
                  borderWidth: 1,
                  borderColor: active ? PALETTE.primary : PALETTE.border,
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, fontWeight: "600", color: active ? PALETTE.surface : PALETTE.text }}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Input
          label="Your question"
          value={message}
          onChangeText={setMessage}
          multiline
          style={{ minHeight: 88, textAlignVertical: "top" }}
        />

        {reply ? (
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <MessageSquare size={18} strokeWidth={1.75} color={PALETTE.primary} />
              <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, fontWeight: "700", color: PALETTE.primary }}>
                Answer
              </Text>
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, lineHeight: 24, color: PALETTE.text }}>
              {reply.response}
            </Text>

            {reply.requires_confirmation && reply.pending_action ? (
              <Button
                title={`Confirm: update price to ₹${reply.pending_action.new_price}`}
                variant="accent"
                onPress={() => askAgent(reply.pending_action.action_id)}
                style={{ marginTop: SPACING.sm }}
              />
            ) : null}
          </Card>
        ) : null}
      </ScrollView>

      <View style={{ padding: SPACING.sm, backgroundColor: PALETTE.bg, borderTopWidth: 1, borderTopColor: PALETTE.border }}>
        <Button title="Ask helper" variant="primary" loading={loading} onPress={() => askAgent()} />
      </View>
    </View>
  );
}
