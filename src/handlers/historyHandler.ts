import AinModule from "../ain";

export const handleHistory = (historyPath?: string) => {
  if(!historyPath) {
    return "";
  }
  if(historyPath.startsWith("database")) {
    // ai network path
    const data = AinModule.getInstance().getValue(historyPath.substring(16)); // slice database/values/ 
  const reversedResentHistory = Object.entries(data)
    .sort()
    .reverse()
    .slice(0,6)
    .map(message=>{
      const role = message[1].role;
      const content = message[1].content[0].text.value;
      return {role, content}
    });
  const resentHistory = reversedResentHistory.reverse();
    console.log(data);
    return data;
  }else {
    // External path not supported yet.
    return "";
  }
}