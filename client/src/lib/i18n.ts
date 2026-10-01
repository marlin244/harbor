/**
 * Localization strings for Harbor
 * Russian language support
 */

export const i18n = {
  // Main navigation
  catalog: 'Каталог',
  timeline: 'Расписание',
  newBooking: 'Новое бронирование',
  data: 'Данные',

  // Header
  appTitle: 'Harbor',
  appSubtitle: 'Планирование помещений и оборудования без пересечений по времени',

  // Catalog view
  resourceCatalog: 'Каталог ресурсов',
  searchResources: 'Поиск ресурсов...',
  allCapacities: 'Все вместимости',
  capacity: 'Вместимость',
  rooms: 'Аудитории',
  assets: 'Инвентарь',
  noRoomsFound: 'Аудитории не найдены',
  noAssetsFound: 'Инвентарь не найден',
  bookRoom: 'Забронировать аудиторию',
  bookAsset: 'Забронировать инвентарь',
  people: 'человек',
  features: 'Особенности',
  inventoryCode: 'Код инвентаря',
  status: 'Статус',
  available: 'Доступно',
  unavailable: 'Недоступно',
  maintenance: 'На обслуживании',

  // Resource management
  manageResources: 'Управление ресурсами',
  addRoomButton: 'Добавить аудиторию',
  addAssetButton: 'Добавить инвентарь',
  editRoom: 'Редактировать аудиторию',
  editAsset: 'Редактировать инвентарь',
  category: 'Категория',
  location: 'Расположение',
  allCategories: 'Все категории',
  allLocations: 'Все локации',
  requiresApproval: 'Требует подтверждения',
  deleteRoomConfirm: 'Вы уверены, что хотите удалить эту аудиторию?',
  deleteAssetConfirm: 'Вы уверены, что хотите удалить этот инвентарь?',

  // Timeline view
  bookingTimeline: 'Расписание броней',
  noBookingsForDay: 'Нет броней на этот день',
  today: 'Сегодня',
  notes: 'Примечания',

  // Booking form
  createNewBooking: 'Создать новое бронирование',
  editBooking: 'Редактировать бронирование',
  fillInDetails: 'Заполните детали ниже',
  updateBookingDetails: 'Обновите детали бронирования',
  resourceType: 'Тип ресурса',
  selectRoom: 'Выберите аудиторию',
  selectAsset: 'Выберите инвентарь',
  room: 'Аудитория',
  asset: 'Инвентарь',
  title: 'Название',
  bookingTitle: 'Название бронирования',
  date: 'Дата',
  startTime: 'Время начала',
  endTime: 'Время окончания',
  addNotes: 'Добавить примечания (опционально)',
  createBooking: 'Создать бронирование',
  updateBooking: 'Обновить бронирование',
  cancel: 'Отмена',

  // Conflict detection
  conflictDetected: 'КОНФЛИКТ ОБНАРУЖЕН',
  conflictsWith: 'Конфликтует с:',
  suggestedSlots: 'Предложенные альтернативные слоты:',
  noConflicts: 'Конфликтов не обнаружено',

  // Booking actions
  edit: 'Редактировать',
  delete: 'Удалить',
  deleteConfirm: 'Вы уверены, что хотите удалить это бронирование?',
  save: 'Сохранить',
  create: 'Создать',

  // Approval workflow
  approvals: 'Подтверждения',
  pendingApproval: 'Ожидает подтверждения',
  awaitingApproval: 'Ожидает подтверждения',
  approve: 'Подтвердить',
  reject: 'Отклонить',
  noApprovalsNeeded: 'Нет броней, ожидающих подтверждения',
  bookingApprovedSuccess: 'Бронирование подтверждено',
  bookingRejectedSuccess: 'Бронирование отклонено',
  failedToUpdateBookingStatus: 'Ошибка при обновлении статуса бронирования',
  cancelledStatus: 'Отменено',

  // Recurring bookings
  repeat: 'Повтор',
  repeatNone: 'Не повторять',
  repeatDaily: 'Ежедневно',
  repeatWeekly: 'Еженедельно',
  repeatCount: 'Количество повторений',
  createSeriesButton: 'Создать серию',
  seriesConflictDetected: 'Не удалось создать серию — конфликты в датах:',
  seriesCreatedSuccess: 'Серия бронирований создана',
  failedToCreateSeries: 'Ошибка при создании серии бронирований',
  deleteThisOccurrence: 'Удалить это бронирование',
  deleteEntireSeries: 'Удалить всю серию',
  seriesDeletedSuccess: 'Серия бронирований удалена',
  failedToDeleteSeries: 'Ошибка при удалении серии бронирований',

  // Notifications center
  notifications: 'Уведомления',
  noNotifications: 'Нет новых уведомлений',

  // Import/Export
  importExport: 'Импорт / Экспорт',
  exportData: 'Экспорт данных',
  exportDescription: 'Скачайте все аудитории, инвентарь и брони в виде JSON файла',
  exportAsJSON: 'Экспорт как JSON',
  importData: 'Импорт данных',
  importDescription: 'Загрузите данные из ранее экспортированного JSON файла',
  selectJSONFile: 'Выберите JSON файл',
  currentDataSummary: 'Сводка текущих данных:',
  importPreview: 'Предпросмотр импорта:',
  fileValidationPassed: 'Валидация файла пройдена',
  importPolicy: 'Политика импорта:',
  mergePolicy: 'Объединение (добавление/обновление по ID)',
  replaceAllPolicy: 'Заменить все (очистить и импортировать)',
  importDataButton: 'Импортировать данные',
  validationErrors: 'Ошибки валидации:',

  // Notifications
  bookingCreatedSuccess: 'Бронирование успешно создано',
  bookingUpdatedSuccess: 'Бронирование успешно обновлено',
  bookingDeletedSuccess: 'Бронирование удалено',
  dataExportedSuccess: 'Данные успешно экспортированы',
  dataImportedSuccess: 'Данные успешно импортированы',
  roomAddedSuccess: 'Аудитория успешно добавлена',
  roomUpdatedSuccess: 'Аудитория успешно обновлена',
  roomDeletedSuccess: 'Аудитория успешно удалена',
  assetAddedSuccess: 'Инвентарь успешно добавлен',
  assetUpdatedSuccess: 'Инвентарь успешно обновлен',
  assetDeletedSuccess: 'Инвентарь успешно удален',

  // Error messages
  failedToLoadData: 'Ошибка при загрузке данных',
  failedToRefreshData: 'Ошибка при обновлении данных',
  failedToCreateBooking: 'Ошибка при создании бронирования',
  failedToUpdateBooking: 'Ошибка при обновлении бронирования',
  failedToDeleteBooking: 'Ошибка при удалении бронирования',
  failedToExportData: 'Ошибка при экспорте данных',
  failedToImportData: 'Ошибка при импорте данных',
  failedToParseJSON: 'Ошибка при разборе JSON файла',
  invalidFileFormat: 'Неверный формат файла',
  cannotImportWithErrors: 'Невозможно импортировать: файл содержит ошибки валидации',
  failedToAddRoom: 'Ошибка при добавлении аудитории',
  failedToUpdateRoom: 'Ошибка при обновлении аудитории',
  failedToDeleteRoom: 'Ошибка при удалении аудитории',
  failedToAddAsset: 'Ошибка при добавлении инвентаря',
  failedToUpdateAsset: 'Ошибка при обновлении инвентаря',
  failedToDeleteAsset: 'Ошибка при удалении инвентаря',

  // Validation errors
  startTimeBeforeEnd: 'Время начала должно быть раньше времени окончания',
  resourceMustExist: 'Выбранный ресурс должен существовать',
  titleRequired: 'Название обязательно',
  resourceRequired: 'Ресурс обязателен',

  // Time format
  loadingApplication: 'Загрузка приложения...',
  loading: 'Загрузка...',

  // Empty states
  noResults: 'Результаты не найдены',

  // Date/Time display
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',

  // Buttons
  newBookingButton: 'Новое бронирование',
  previousDay: 'Предыдущий день',
  nextDay: 'Следующий день',
  export: 'Экспорт',
  import: 'Импорт',
};

export type I18nKey = keyof typeof i18n;

/**
 * Get translation by key
 */
export function t(key: I18nKey): string {
  return i18n[key];
}
