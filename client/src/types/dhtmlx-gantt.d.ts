declare module 'dhtmlx-gantt' {
  namespace gantt {
    function init(container: string | HTMLElement): void;
    function parse(data: any): void;
    function attachEvent(name: string, handler: Function): any;
    function detachEvent(id: any): void;
    function clearAll(): void;
    function config: {
      xml_date: string;
      start_date: Date;
      end_date: Date;
      readonly: boolean;
      [key: string]: any;
    };
    function templates: {
      task_text: (start: Date, end: Date, task: any) => string;
      task_class: (start: Date, end: Date, task: any) => string;
      [key: string]: any;
    };
  }
  export default gantt;
}