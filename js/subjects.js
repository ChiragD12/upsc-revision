const UNIVERSAL_SUBJECT_DATA = [
    {
        subject: "Polity",
        icon: "&#x1F3DB;&#xFE0F;",
        enabled: true,
        topics: [
            {
                id: "fundamentalRights",
                title: "Fundamental Rights",
                icon: "shield",
                enabled: true,
                dataset: [
                    {
                        id: "fr-1",
                        subject: "Polity",
                        topic: "Fundamental Rights",
                        difficulty: "easy",
                        title: "Article 21",
                        description: "Article 21 protects the right to life and personal liberty.",
                        keywords: ["Article 21", "life", "liberty"],
                        related: ["Article 14", "Article 19", "Article 22"],
                        explanation: "Article 21 of the Constitution of India, 1950 provides that 'No person shall be deprived of his life or personal liberty except according to procedure established by law.' It is a fundamental right available to all persons, citizens and non-citizens alike.",
                        facts: [
                            {
                                statement: "Which article guarantees the Right to Life and Personal Liberty?",
                                answer: "Right to life and personal liberty"
                            },
                            {
                                assertion: "Article 21 is available to both citizens and non-citizens.",
                                reason: "The term 'person' used in Article 21 has been interpreted to include all individuals, not just citizens.",
                                arCorrect: 0 // Both true, R is correct explanation
                            },
                            {
                                statement: "The scope of Article 21 has been expanded by judicial interpretation to include the right to a clean environment.", isCorrect: true
                            }
                        ],
                        questionTypes: ["mcq", "reverseMcq", "assertionReason"]
                    },
                    {
                        id: "fr-2",
                        subject: "Polity",
                        topic: "Fundamental Rights",
                        difficulty: "easy",
                        title: "Right to Equality",
                        description: "Equality before law and equal protection of laws are guaranteed under Article 14.",
                        explanation: "Article 14 states that 'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.' It is a cornerstone of the fundamental rights.",
                        keywords: ["equality", "Article 14"],
                        related: ["Article 15", "Article 16", "Article 17"],
                        facts: [
                            {
                                statement: "The Right to Equality prohibits discrimination on grounds of religion, race, caste, sex or place of birth.", isCorrect: true
                            },
                            {
                                statement: "The Right to Equality is an absolute right with no exceptions.", isCorrect: false
                            },
                            {
                                statement: "Article 14 guarantees equality before the law.", isCorrect: true
                            },
                            {
                                statement: "The concept of 'equal protection of laws' is taken from the British Constitution.", isCorrect: false
                            }
                        ],
                        questionTypes: ["statementBased", "multipleCorrect"]
                    },
                    {
                        id: "fr-3",
                        subject: "Polity",
                        topic: "Fundamental Rights",
                        difficulty: "easy",
                        title: "Constitutional Remedies",
                        description: "Article 32 provides the right to constitutional remedies.",
                        explanation: "Dr. B.R. Ambedkar called Article 32 the 'heart and soul' of the Constitution. It gives citizens the right to move the Supreme Court directly for the enforcement of their fundamental rights.",
                        keywords: ["Article 32", "remedies"],
                        related: ["Article 226", "Habeas Corpus", "Mandamus"],
                        facts: [
                            {
                                statement: "Which Article is known as the 'heart and soul' of the Constitution?",
                                explanation: "Article 32 is called the 'heart and soul' of the Constitution by Dr. B.R. Ambedkar because it provides for constitutional remedies.",
                                answer: "Article 32"
                            }
                        ],
                        questionTypes: ["assertionReason", "mcq"]
                    }
                ]
            },
            {
                id: "directivePrinciples",
                title: "Directive Principles",
                icon: "scroll",
                enabled: true,
                dataset: [
                    {
                        id: "dp-1",
                        subject: "Polity",
                        topic: "Directive Principles",
                        difficulty: "easy",
                        title: "Directive Principles",
                        description: "Directive Principles guide the state in policy making.",
                        explanation: "DPSP are enumerated in Part IV of the Constitution from Articles 36 to 51. They are not enforceable by any court, but the principles laid down therein are considered fundamental in the governance of the country.",
                        keywords: ["directive principles", "state policy"],
                        related: ["Fundamental Rights", "welfare state", "social justice"],
                        facts: [
                            {
                                statement: "What is the nature of Directive Principles of State Policy (DPSP)?",
                                explanation: "DPSP are non-justiciable, meaning they are not enforceable by the courts for their violation.",
                                answer: "Non-justiciable policy guidelines"
                            }
                        ],
                        questionTypes: ["mcq"]
                    }
                ]
            }
        ]
    },
    {
        subject: "Economy",
        icon: "&#x1F4B0;",
        enabled: false,
        topics: []
    }
];
