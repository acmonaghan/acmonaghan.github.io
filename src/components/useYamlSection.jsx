// hooks/useYamlSection.js
import { useEffect, useState } from "react";
import yaml from "js-yaml";

const useYamlSection = (sectionName) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!sectionName) return;

    fetch(`/content/${sectionName}.yaml`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${sectionName}.yaml`);
        return res.text();
      })
      .then((yamlText) => {
        const parsed = yaml.load(yamlText);
        setData(parsed);
      })
      .catch((err) => {
        console.error(`Error fetching ${sectionName}:`, err);
      });
  }, [sectionName]);

  return data;
};

export default useYamlSection;
