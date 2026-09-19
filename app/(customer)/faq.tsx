import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useFonts, Gabarito_800ExtraBold } from '@expo-google-fonts/gabarito';
import { Figtree_500Medium, Figtree_700Bold } from '@expo-google-fonts/figtree';

const FAQS = [
  { id: '1', q: 'How does Run4Me work?', a: 'Run4Me connects you with verified errand runners nearby. Simply choose a service type (e.g., Shop for Me, Pick Up, or Pharmacy), set details and budget, and a secure payment is processed to hold. A matched Runner completes the errand and receives funds only upon your final verification.' },
  { id: '2', q: 'How is the price calculated?', a: 'Pricing is based on errand service fee, distance fee, platform fee, and your approved shopping budget.' },
  { id: '3', q: 'Can I cancel an errand?', a: 'Yes, you can cancel before a Runner is assigned. After assignment, cancellation fees may apply.' },
  { id: '4', q: 'What happens when an item is unavailable?', a: 'Your Runner will suggest a suitable alternative. You approve, choose another, or skip.' },
  { id: '5', q: 'How do refunds work?', a: 'Any unspent budget is refunded to your Run4Me Wallet immediately after errand completion.' },
  { id: '6', q: 'How do I become an Errand Runner?', a: 'Register as a Runner, complete KYC (NIN + selfie), and you will be reviewed within 24 hours.' },
  { id: '7', q: 'How do runners get paid?', a: 'Runners receive payouts to their linked bank account every 24 hours.' },
];

export default function FAQ() {
  const [openId, setOpenId] = useState('1');
  const [fontsLoaded] = useFonts({ Gabarito_800ExtraBold, Figtree_500Medium, Figtree_700Bold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 px-6 pt-5 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full border border-border items-center justify-center">
          <Feather name="arrow-left" size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-[20px] font-gabarito text-text-dark">Frequently Asked</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="px-6">
          {/* Banner */}
          <View className="bg-primary rounded-2xl p-4 mb-5">
            <Text className="text-[16px] font-gabarito text-white mb-1">Need quick answers?</Text>
            <Text className="text-[12px] font-figtree text-white/85 leading-[18px]">
              Our most frequently asked questions about tasks, payments and security.
            </Text>
          </View>

          {/* FAQs */}
          <View className="gap-3">
            {FAQS.map((faq, index) => {
              const isOpen = openId === faq.id;
              const isFirst = index === 0;
              return (
                <View key={faq.id} className={`rounded-2xl bg-white ${isOpen && isFirst ? 'border-2 border-primary' : 'border border-border'}`}>
                  <TouchableOpacity onPress={() => setOpenId(isOpen ? '' : faq.id)} activeOpacity={0.75}
                    className="flex-row items-center justify-between px-4 py-4">
                    <Text className="flex-1 text-[13px] font-figtree-bold text-text-dark pr-3">{faq.q}</Text>
                    <Feather name={isOpen ? 'minus' : 'plus'} size={16} color="#006B75" />
                  </TouchableOpacity>

                  {isOpen && (
                    <View className="px-4 pb-4">
                      <Text className="text-[12px] font-figtree text-text-gray leading-[18px]">{faq.a}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}