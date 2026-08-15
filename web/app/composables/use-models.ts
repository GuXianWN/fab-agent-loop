const models = [{
  label: 'deepseek-v4-flash',
  value: 'deepseek-v4-flash',
  icon: 'i-lucide-sparkles',
}];

export function useModels() {
  const model = useState('selected-model', () => models[0]!.value);

  return { model, models };
}
